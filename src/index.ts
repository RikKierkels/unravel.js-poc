import { File as Ast, Node } from '@babel/types';
import { parse } from '@babel/parser';
import { getFiles, getFileNames, File, FileWithDependencies } from './file';
import { Checker, checkImportDeclaration } from './check';
import visit from './visit';

export type Maybe<T> = T | null | undefined;

type Options = {
  checkers: Checker[];
};

const defaultOptions: Options = {
  checkers: [checkImportDeclaration],
};

async function run(patterns: string[], { checkers }: Options = defaultOptions) {
  const files = await getFiles(getFileNames(patterns));

  const filesWithDependencies = files
    .map<[File, Ast]>((file) => [file, parse(file.content, { sourceType: 'module' })])
    .map<[File, Node[]]>(([file, ast]) => [file, visit(ast)])
    .map<FileWithDependencies>(([file, nodes]) => ({
      ...file,
      dependencies: nodes.flatMap((node) => checkers.flatMap((checker) => checker(node))),
    }));

  console.log(files);
}

(async () => await run(['src/test-modules/*']))();
