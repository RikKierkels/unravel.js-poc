import { Node } from '@babel/types';

// Example: import a = require("a");
//           export { a };
export default function detectTypescriptImportEqualsDeclaration(node: Node): string | null {
  return node.type === 'TSImportEqualsDeclaration' &&
    node.moduleReference &&
    'expression' in node.moduleReference &&
    node.moduleReference.expression
    ? node.moduleReference.expression.value
    : null;
}
