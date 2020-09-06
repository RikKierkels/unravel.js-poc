import { Node } from '@babel/types';
import { Maybe } from './index';

export type Checker = (node: Node) => [string] | [];

export function checkImportDeclaration(node: Node): [string] | [] {
  return node.type === 'ImportDeclaration' && node.source && node.source.value ? [node.source.value] : [];
}
