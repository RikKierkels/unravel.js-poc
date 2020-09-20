import { readFile } from 'fs';
import { sync } from 'glob';
import { join, dirname, parse as parsePath } from 'path';
import { Node } from '@babel/types';
import { cloneDeep, last } from 'lodash';
import { parse } from '@babel/parser';
import { detectImportDeclaration, Detector, detectRequireCallExpression } from './detect';
import visit, { Ast } from './visit';
import chalk from 'chalk';
import parseEs6, { Parser } from './parser/es6';
import parseTypescript from './parser/typescript';

type Dependency = {
  from: string;
  to: string;
};

type Module = {
  name: string;
  path: string;
  // TODO: Other name? Confusing as you expect an array of type Dependency here.
  dependencies: Module[];
};

type Options = {
  root: string;
  detectors: Detector[];
  ignore: string[];
};

async function run(patterns: string[], { detectors, ignore, root }: Options) {
  let dependencies: Dependency[] = (
    await Promise.all(
      patterns
        .flatMap((pattern) => match(pattern, ignore, root))
        .reduce<string[]>((paths, path) => (paths.includes(path) ? paths : [...paths, path]), [])
        .map((path) => getDependencies(detectors, path)),
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
  return sync(pattern, { absolute: true, ignore, nodir: true, root });
}

function withoutFileExtension(path: string): string {
  const { dir, name } = parsePath(path);
  return join(dir, name);
}

async function getDependencies(detectors: Detector[], filepath: string): Promise<Dependency[]> {
  const ast = await parseFile(filepath);

  return visit(ast)
    .flatMap((node) => detect(detectors, node))
    .map((pathOfDependency) => resolveRelativeTo(filepath, pathOfDependency))
    .map((pathOfDependency) => ({ from: withoutFileExtension(filepath), to: withoutFileExtension(pathOfDependency) }));
}

async function parseFile(filepath: string): Promise<Ast> {
  const fileContent = await readFileAsync(filepath);
  return parse(fileContent, { sourceType: 'module' });
}

function detect(detectors: Detector[], node: Node): string[] {
  return detectors.map((detect) => detect(node) || '').filter((result) => result);
}

function resolveRelativeTo(path: string, otherPath: string): string {
  return join(dirname(path), otherPath);
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
  await run(['src/test-modules/**'], {
    root: 'src',
    detectors: [detectImportDeclaration, detectRequireCallExpression],
    ignore: ['src/test-modules/module-c.js'],
  }))();
