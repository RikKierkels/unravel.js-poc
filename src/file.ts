import { sync } from 'glob';
import { readFile } from 'fs/promises';

export type File = {
  name: string;
  content: string;
};

export type FileWithDependencies = File & { dependencies?: string[] };

function getFileNames(patterns: string[]): string[] {
  return patterns
    .flatMap((pattern) => sync(pattern))
    .reduce<string[]>((names, name) => (names.includes(name) ? names : [...names, name]), []);
}

async function getFile(name: string): Promise<File> {
  return readFile(name, 'utf-8')
    .catch(() => '')
    .then((content) => ({ name, content }));
}

async function getFiles(names: string[]): Promise<File[]> {
  return Promise.all(names.map(getFile)).then((files) => files.filter(({ content }) => content));
}

export { getFileNames, getFile, getFiles };
