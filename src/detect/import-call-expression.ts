import { Node } from '@babel/types';

export default function importCallExpression(node: Node): string | null {
  return node.type === 'CallExpression' &&
    node.callee &&
    ((node.callee.type === 'Identifier' && node.callee.name === 'import') ||
      node.callee.type === 'Import' ||
      (node.callee.type === 'MemberExpression' &&
        'name' in node.callee.object &&
        node.callee.object?.name === 'System' &&
        'name' in node.callee.property &&
        node.callee.property?.name === 'import')) &&
    'value' in node.arguments[0] &&
    typeof node.arguments[0]?.value === 'string'
    ? node.arguments[0].value
    : null;
}
