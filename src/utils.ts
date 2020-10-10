import JSON5 from 'json5';
import fs from 'fs';
import path from 'path';

export async function readFile(filePath: string): Promise<string> {
  return new Promise((resolve) => fs.readFile(filePath, 'utf-8', (err, text) => (err ? resolve('') : resolve(text))));
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

export function toAbsolutePathFromDir(fromPath: string, toPath: string): string {
  return path.resolve(path.dirname(fromPath), toPath);
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
