import { File, Node } from '@babel/types';
import { Maybe } from './detect';

export type Ast = File;

export default function visit(ast: Maybe<Ast>, visited = new WeakSet<Node>()): Node[] {
  if (!ast || visited.has(ast)) return [];

  if (Array.isArray(ast)) {
    return ast.flatMap((node) => visit(node, visited));
  }

  if (ast.type) {
    return Object.keys(ast)
      .filter((key) => key !== 'comments' && key !== 'trailingComments' && key !== 'tokens')
      .flatMap((key) => visit(ast[key], visited.add(ast)))
      .concat(ast);
  }

  return [];
}
