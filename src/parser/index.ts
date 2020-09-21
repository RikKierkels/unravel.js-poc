import parseEs6 from './es6';
import parseTypescript from './typescript';
import { Ast } from '../visit';
import { parse as parsePath } from 'path';
import { readFile } from 'fs';

export type ParseFn = (input: string) => Ast;
export type Parser = { pattern: string; parse: ParseFn };

const parsers: Parser[] = [
  { pattern: '.js', parse: parseEs6 },
  { pattern: '.ts', parse: parseTypescript },
];

async function readFileAsync(path: string): Promise<string> {
  return new Promise((resolve) => readFile(path, 'utf-8', (err, data) => (err ? resolve('') : resolve(data))));
}

function getParse(path: string): ParseFn {
  const { base } = parsePath(path);
  const parseFn = parsers.find(({ pattern }) => new RegExp(pattern).test(base))?.parse;
  return parseFn || parseEs6;
}

export async function parse(path: string): Promise<Ast> {
  const parse = getParse(path);
  return readFileAsync(path).then((fileContent) => parse(fileContent));
}
