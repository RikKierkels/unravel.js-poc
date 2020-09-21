import parseEs6 from './es6';
import parseTypescript from './typescript';
import { Ast } from '../visit';
import { parse as parsePath } from 'path';
import { readFile } from 'fs';

type Parse = (input: string) => Ast;
type Parser = { pattern: string; parse: Parse };

const DEFAULT_PARSER = { pattern: '.js', parse: parseEs6 };
const PARSERS: Parser[] = [DEFAULT_PARSER, { pattern: '.ts', parse: parseTypescript }];

async function readFileAsync(path: string): Promise<string> {
  return new Promise((resolve) => readFile(path, 'utf-8', (err, data) => (err ? resolve('') : resolve(data))));
}

function getParser(path: string): Parser {
  const { base } = parsePath(path);
  return PARSERS.find(({ pattern }) => new RegExp(pattern).test(base)) || DEFAULT_PARSER;
}

export async function parse(path: string): Promise<Ast> {
  const { parse } = getParser(path);
  return readFileAsync(path).then(parse);
}
