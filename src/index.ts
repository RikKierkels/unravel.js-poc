import glob from 'glob';
import { join, parse as parsePath } from 'path';
import { Node } from '@babel/types';
import { cloneDeep, last } from 'lodash';
import { detectImportDeclaration, Detector, detectRequireCallExpression } from './detect';
import visit from './visit';
import chalk from 'chalk';
import { parse } from './parser';
import { resolve } from './path-resolver';
import { getInstalledPackages } from './installed-packages';
import getPathConfigs from './path-config';

type Dependency = {
  from: string;
  to: string;
};

type Module = {
  name: string;
  path: string;
  dependencies: Module[];
};

type Options = {
  root?: string;
  ignore?: string[];
  detectors: Detector[];
};

async function run(patterns: string[], { detectors = [], ignore = [], root = process.cwd() }: Options) {
  const installedPackages = await getInstalledPackages(root);
  const pathConfigs = await getPathConfigs(root);

  console.log(pathConfigs);

  let dependencies: Dependency[] = (
    await Promise.all(
      patterns
        .flatMap((pattern) => match(pattern, ignore, root))
        .reduce<string[]>((paths, path) => (paths.includes(path) ? paths : [...paths, path]), [])
        .map((path) => getDependencies(installedPackages, detectors, path)),
    )
  ).flat();

  const modules = mapToUniqueModules(dependencies, root).map((module, _, modules) => {
    module.dependencies = dependencies
      .filter(({ from }) => from === module.path)
      .flatMap(({ to }) => modules.find((module) => module.path === to) || [])
      .map((modules) => cloneDeep(modules));
    return module;
  });

  modules.forEach((module) => print([module]));
}

function match(pattern: string, ignore: string[] = [], root: string): string[] {
  return glob.sync(pattern, { absolute: true, ignore, nodir: true, root });
}

async function getDependencies(
  installedPackages: string[],
  detectors: Detector[],
  filepath: string,
): Promise<Dependency[]> {
  const ast = await parse(filepath);

  return visit(ast)
    .flatMap((node) => detect(detectors, node))
    .map((dependency) => ({ from: filepath, to: resolve(installedPackages, filepath, dependency) }));
}

function detect(detectors: Detector[], node: Node): string[] {
  return detectors.map((detect) => detect(node) || '').filter((result) => result);
}

function mapToUniqueModules(dependencies: Dependency[], rootDirectory: string): Module[] {
  return dependencies.reduce<Module[]>(
    (modules, { from, to }) => [
      ...modules,
      ...[from, to]
        .filter((path) => !modules.some((module) => module.path === path))
        .map((path) => ({ name: getModuleName(rootDirectory, path), path, dependencies: [] })),
    ],
    [],
  );
}

function getModuleName(rootDirectory: string, path: string): string {
  const { dir, name } = parsePath(path);
  return join(last(dir.split(rootDirectory))!, name);
}

function print(modules: Module[], indentation: number = 0, maxIndentation = 2): void {
  if (indentation === maxIndentation) return;

  const isRootModule = indentation === 0;

  modules.forEach((module) => {
    if (isRootModule) {
      console.log('\n');
      console.log(chalk.inverse(module.name));
    } else {
      const prefix = '-'.repeat(indentation) + '→ ';
      console.log(chalk.white(`${prefix}${module.name}`));
    }

    print(module.dependencies, indentation + 1);
  });
}

(async () =>
  await run(['src/**'], {
    detectors: [detectImportDeclaration, detectRequireCallExpression],
  }))();
