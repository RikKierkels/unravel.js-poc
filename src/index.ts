import { readFile } from 'fs/promises';
import { sync } from 'glob';
import { join, dirname } from 'path';
import { Node } from '@babel/types';
import { parse } from '@babel/parser';
import { detectImportDeclaration, Detector } from './detect';
import visit, { Ast } from './visit';

type Dependency = {
  from: string;
  to: string;
};

type File = {
  path: string;
  // TODO: Other name? Confusing as you expect an array of type Dependency here.
  dependencies: File[];
};

type Options = {
  detectors: Detector[];
  ignore: string[];
};

async function run(patterns: string[], { detectors, ignore }: Options) {
  let dependencies: Dependency[] = (
    await Promise.all(
      patterns
        .flatMap((pattern) => match(pattern, ignore))
        .reduce<string[]>((paths, path) => (paths.includes(path) ? paths : [...paths, path]), [])
        .map((path) => getDependencies(detectors, path)),
    )
  )
    .flat()
    // TODO: Find better way of handling file extensions
    .map(({ from, to }) => ({ from: withoutFileExtension(from), to: withoutFileExtension(to) }));

  let files = mapDependenciesToUniqueFiles(dependencies);

  for (const file of files) {
    file.dependencies = dependencies
      .filter(({ from }) => from === file.path)
      .flatMap(({ to }) => files.find((file) => file.path === to) || []);
  }
}

function match(pattern: string, ignore: string[] = []): string[] {
  return sync(pattern, { absolute: true, ignore, nodir: true });
}

function withoutFileExtension(path: string): string {
  return path.split('.')[0];
}

async function getDependencies(detectors: Detector[], filepath: string): Promise<Dependency[]> {
  const ast = await parseFile(filepath);

  return visit(ast)
    .flatMap((node) => detect(detectors, node))
    .map((pathOfDependency) => resolveRelativeTo(filepath, pathOfDependency))
    .map((dependency) => ({ from: filepath, to: dependency }));
}

async function parseFile(filepath: string): Promise<Ast> {
  const fileContents = await readFile(filepath, 'utf-8');
  return parse(fileContents, { sourceType: 'module' });
}

function detect(detectors: Detector[], node: Node): string[] {
  return detectors.map((detect) => detect(node) || '').filter((result) => result);
}

function resolveRelativeTo(path: string, otherPath: string): string {
  return join(dirname(path), otherPath);
}

function mapDependenciesToUniqueFiles(dependencies: Dependency[]): File[] {
  return dependencies.reduce<File[]>(
    (files, { from, to }) => [
      ...files,
      ...[from, to]
        .filter((path) => !files.some((file) => file.path === path))
        .map((path) => ({ path, dependencies: [] })),
    ],
    [],
  );
}

(async () =>
  await run(['src/test-modules/**'], {
    detectors: [detectImportDeclaration],
    ignore: ['src/test-modules/module-c.js'],
  }))();
