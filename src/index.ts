import { File as Ast, Node } from '@babel/types';
import { parse as parseFile } from '@babel/parser';
import { detectImportDeclaration, Detector } from './check';
import visit from './visit';
import { glob } from 'glob';
import { readFile } from 'fs/promises';

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
  return glob.sync(pattern, { nodir: true, ignore });
}

async function getDependencies(detectors: Detector[], filename: string): Promise<string[]> {
  const ast = await parse(filename);
  return visit(ast).flatMap((node) => detect(detectors, node));
}

async function parse(filename: string): Promise<Ast> {
  const file = await readFile(filename, 'utf-8');
  return parseFile(file, { sourceType: 'module' });
}

function detect(detectors: Detector[], node: Node): string[] {
  return detectors.map((detect) => detect(node) || '').filter((result) => result);
}

(async () =>
  await run(['src/test-modules/*'], {
    detectors: [detectImportDeclaration],
    ignore: ['src/test-modules/module-c.js'],
  }))();
