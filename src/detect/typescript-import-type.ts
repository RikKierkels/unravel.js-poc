import { Node } from '@babel/types';

// Example: import("/z").foo.bar<string>;
export default function detectTypescriptImportType(node: Node): string | null {
  return node.type === 'TSImportType' && node.argument?.value ? node.argument.value : null;
}
