import * as glob from 'glob';
import * as path from 'path';
import { Maybe } from './detect';
import readJsonFile from './json';

export function getInstalledPackages(root: string): Promise<string[]> {
  return Promise.all(
    glob
      .sync('**/package.json', { root, ignore: ['node_modules/**'] })
      .map((packageJsonPath) => path.resolve(root, packageJsonPath))
      .map(extractInstalledPackages),
  ).then((packages) => packages.flat());
}

async function extractInstalledPackages(packageJsonPath: string): Promise<string[]> {
  return readJsonFile(packageJsonPath).then(
    ({ dependencies, devDependencies }) => [...keys(dependencies), ...keys(devDependencies)],
    () => [],
  );
}

function keys(object: Maybe<Object>): string[] {
  return Object.keys(object || {});
}
