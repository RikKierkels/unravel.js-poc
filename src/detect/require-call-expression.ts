import { Node } from '@babel/types';

export default function detectRequireCallExpression(node: Node): string | null {
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
