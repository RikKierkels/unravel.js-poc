import { readFile } from 'fs/promises';
import { sync } from 'glob';
import { join, dirname } from 'path';
import { Node } from '@babel/types';
import { parse } from '@babel/parser';
import { detectImportDeclaration, Detector } from './detect';
import visit, { Ast } from './visit';

type File = {
  path: string;
  dependencies: File[];
};

type Options = {
  detectors: Detector[];
  ignore: string[];
};

async function run(patterns: string[], { detectors, ignore }: Options) {
  const pathsWithDependencies = patterns
    .flatMap((pattern) => match(pattern, ignore))
    .reduce<string[]>((paths, path) => (paths.includes(path) ? paths : [...paths, path]), [])
    .map((path) => getDependencies(detectors, path).then((dependencies) => ({ path, dependencies })));

  let paths = await Promise.all(pathsWithDependencies);

  // TODO: Find a cleaner way to handle file extensions
  paths = paths.map(({ path, dependencies }) => ({
    path: withoutFileExtension(path),
    dependencies: dependencies.map(withoutFileExtension),
  }));

  // TODO: Refactor this to something that's actually readable and not some imperative mess :-)
  // TODO: What about circular dependencies? That would trip up graph logic
  let files: File[] = [];
  for (const path of paths) {
    let file = files.find((file) => file.path === path.path);

    if (!file) {
      file = { path: path.path, dependencies: [] };
      files = [...files, file];
    }

    for (let dependency of path.dependencies) {
      let dependencyFile = files.find((file) => file.path === dependency);

      if (!dependencyFile) {
        dependencyFile = { path: dependency, dependencies: [] };
        files = [...files, dependencyFile];
      }

      file.dependencies = [...file.dependencies, dependencyFile];
    }
  }
}

function match(pattern: string, ignore: string[] = []): string[] {
  return sync(pattern, { absolute: true, ignore, nodir: true });
}

function withoutFileExtension(path: string): string {
  return path.split('.')[0];
}

async function getDependencies(detectors: Detector[], filepath: string): Promise<string[]> {
  const ast = await parseFile(filepath);

  return visit(ast)
    .flatMap((node) => detect(detectors, node))
    .map((dependency) => resolveRelativeTo(filepath, dependency));
}

async function parseFile(filepath: string): Promise<Ast> {
  const file = await readFile(filepath, 'utf-8');
  return parse(file, { sourceType: 'module' });
}

function detect(detectors: Detector[], node: Node): string[] {
  return detectors.map((detect) => detect(node) || '').filter((result) => result);
}

function resolveRelativeTo(filepath: string, dependency: string): string {
  return join(dirname(filepath), dependency);
}

(async () =>
  await run(['src/test-modules/**'], {
    detectors: [detectImportDeclaration],
    ignore: ['src/test-modules/module-c.js'],
  }))();
