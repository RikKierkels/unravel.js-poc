import { Node } from '@babel/types';

export default function detectImportDeclaration(node: Node): string | null {
  return node.type === 'ImportDeclaration' && node.source?.value ? node.source.value : null;
}
