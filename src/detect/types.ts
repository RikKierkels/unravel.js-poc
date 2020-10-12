import { Node } from '@babel/types';

export type Detector = (node: Node) => string | null;
