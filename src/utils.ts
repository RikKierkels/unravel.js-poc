import JSON5 from 'json5';
import fs from 'fs';

export async function readFile(filePath: string): Promise<string> {
  return new Promise((resolve) => fs.readFile(filePath, 'utf-8', (err, text) => (err ? resolve('') : resolve(text))));
}

export async function readJson(path: string): Promise<any> {
  return readFile(path).then(JSON5.parse);
}
