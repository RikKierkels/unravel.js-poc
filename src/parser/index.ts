import parseEs6 from './es6';
import parseTypescript from './typescript';
import { Ast } from '../visit';
import { readFile } from 'fs';
import * as path from 'path';
import minimatch from 'minimatch';
import { Maybe } from '../detect';

type Parse = (input: string) => Ast;
type Parser = { pattern: string; parse: Parse };

const PARSERS: Parser[] = [
  { pattern: '*.js', parse: parseEs6 },
  { pattern: '*.ts', parse: parseTypescript },
];

export async function parse(filePath: string): Promise<Maybe<Ast>> {
  const { base } = path.parse(filePath);
  const parser = getParser(base);
  return parser ? readFileAsync(filePath).then(parser.parse) : null;
}

function getParser(fileBase: string): Maybe<Parser> {
  return PARSERS.find(({ pattern }) => minimatch(fileBase, pattern, { noglobstar: true }));
}

async function readFileAsync(filePath: string): Promise<string> {
  return new Promise((resolve) => readFile(filePath, 'utf-8', (err, data) => (err ? resolve('') : resolve(data))));
}
