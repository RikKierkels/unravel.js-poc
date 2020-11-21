import JSON5 from 'json5';
import fs from 'fs';
import path from 'path';
import util from 'util';

const readFileAsync = util.promisify(fs.readFile);

export async function readFile(filePath: string): Promise<string> {
  return readFileAsync(filePath, 'utf-8').catch(() => '');
}

export async function readJson<T>(path: string): Promise<T> {
  return readFile(path).then(
    (text) => JSON5.parse(text),
    () => ({}),
  );
}

export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

export function toPosixPath(modulePath: string): string {
  return modulePath.replace(/\\/g, '/');
}

export function isRelativePath(modulePath: string): boolean {
  return /^\.?\.\//.test(modulePath);
}

export function toRelativePath(modulePath: string): string {
  return isRelativePath(modulePath) ? modulePath : `./${modulePath}`;
}

export function mapToRelativePath(root: string, fromPath: string, toPath: string): string {
  let from = path.dirname(fromPath);
  let to = path.normalize(toPath);

  from = path.resolve(root, from);
  to = path.resolve(root, to);

  return toRelativePath(path.relative(from, to));
}

export function takeLast<T>(array: T[]): T {
  return array[array.length - 1];
}
