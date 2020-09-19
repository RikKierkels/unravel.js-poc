import { parse } from '@babel/parser';
import { Ast } from '../visit';

export type Parser = (input: string) => Ast;

export default function parseEs6(input: string): Ast {
  return parse(input, { sourceType: 'module' });
}
