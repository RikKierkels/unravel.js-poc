import { File as Ast, Node } from '@babel/types';
import { parse } from '@babel/parser';
import { getFiles, getFileNames, File } from './file';
import visit from './visit';

export type Maybe<T> = T | null | undefined;

type Checker = (node: Node) => Maybe<string>;
type Options = {
  checkers: Checker[];
};

async function run(patterns: string[], options?: Options) {
  const files = await getFiles(getFileNames(patterns));
  const bla = files
    .map<[File, Ast]>((file) => [file, parse(file.content, { sourceType: 'module' })])
    .map<[File, Node[]]>(([file, ast]) => [file, visit(ast)]);
  console.log(bla);
}

(async () => await run(['src/test-modules/*']))();
