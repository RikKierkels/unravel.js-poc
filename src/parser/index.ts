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

function getParser(path: string): ParseFn {
  const { base } = parsePath(path);
  const parser = parsers.find(({ pattern }) => new RegExp(pattern).test(base));
  return () => parser?.parse(path) || parseEs6(path);
}

export async function parse(path: string): Promise<Ast> {
  const fileContent = await readFileAsync(path);
  return getParser(path)(path);
}
