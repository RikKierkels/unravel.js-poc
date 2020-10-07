import JSON5 from 'json5';
import fs from 'fs';

export async function readFile(filePath: string): Promise<string> {
  return new Promise((resolve) => fs.readFile(filePath, 'utf-8', (err, text) => (err ? resolve('') : resolve(text))));
}

export async function readJson<T>(path: string): Promise<T> {
  return readFile(path).then(JSON5.parse);
}

export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}
