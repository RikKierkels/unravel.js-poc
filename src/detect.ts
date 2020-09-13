import { Node } from '@babel/types';

export type Maybe<T> = T | null | undefined;
export type Detector = (node: Node) => Maybe<string>;

export function detectImportDeclaration(node: Node): Maybe<string> {
  return node.type === 'ImportDeclaration' && node.source?.value ? node.source.value : null;
}

export function detectRequireCallExpression(node: Node): Maybe<string> {
  if (
    node.type !== 'CallExpression' ||
    node.callee?.type !== 'Identifier' ||
    node.callee?.name !== 'require' ||
    node.arguments.length !== 1
  ) {
    return null;
  }

  const [argument] = node.arguments;

  if (['Literal', 'StringLiteral'].includes(argument.type)) {
    return 'value' in argument && typeof argument.value === 'string' ? argument.value : null;
  }

  return argument.type === 'TemplateLiteral' && argument.quasis.length === 1 && argument.expressions.length === 0
    ? argument.quasis[0].value.raw
    : null;
}
