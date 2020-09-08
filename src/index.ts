import { readFile } from 'fs/promises';
import { sync } from 'glob';
import { resolve, join, dirname } from 'path';
import { Node } from '@babel/types';
import { parse } from '@babel/parser';
import { detectImportDeclaration, Detector } from './detect';
import visit, { Ast } from './visit';

type Options = {
  detectors: Detector[];
  ignore: string[];
};

async function run(patterns: string[], { detectors, ignore }: Options) {
  const debug = patterns
    .flatMap((pattern) => match(pattern, ignore))
    .reduce<string[]>(
      (filenames, filename) => (filenames.includes(filename) ? filenames : [...filenames, filename]),
      [],
    )
    .map((filename) => getDependencies(detectors, filename).then((dependencies) => ({ filename, dependencies })));

  console.log(await Promise.all(debug));
}

function match(pattern: string, ignore: string[] = []): string[] {
  return sync(pattern, { absolute: true, ignore, nodir: true });
}

async function getDependencies(detectors: Detector[], filename: string): Promise<string[]> {
  const ast = await parseFile(filename);
  return visit(ast)
    .flatMap((node) => detect(detectors, node))
    .flatMap((dependency) => resolveRelativeTo(filename, dependency));
}

async function parseFile(filename: string): Promise<Ast> {
  const file = await readFile(filename, 'utf-8');
  return parse(file, { sourceType: 'module' });
}

function detect(detectors: Detector[], node: Node): string[] {
  return detectors.map((detect) => detect(node) || '').filter((result) => result);
}

function resolveRelativeTo(filename: string, dependency: string): string {
  return join(dirname(filename), dependency);
}

(async () =>
  await run(['src/test-modules/**'], {
    detectors: [detectImportDeclaration],
    ignore: ['src/test-modules/module-c.js'],
  }))();
