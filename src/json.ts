import JSON5 from 'json5';
import { readFileAsync } from './parser';

export default async function readJsonFile(path: string): Promise<any> {
  return readFileAsync(path).then((text) => JSON5.parse(text));
}
