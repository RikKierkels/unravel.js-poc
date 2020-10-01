import { parse } from '@babel/parser';
import { Ast } from '../visit';

export default function parseEs6(input: string): Ast {
  return parse(input, { sourceType: 'module' });
}
