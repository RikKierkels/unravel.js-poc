import { Node } from '@babel/types';

export type Maybe<T> = T | null | undefined;
export type Detector = (node: Node) => Maybe<string>;

export function detectImportDeclaration(node: Node): Maybe<string> {
  return node.type === 'ImportDeclaration' && node.source && node.source.value ? node.source.value : null;
}
