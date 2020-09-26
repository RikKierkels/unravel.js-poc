import * as glob from 'glob';
import * as path from 'path';

export function getInstalledPackages(root: string): string[] {
  return glob
    .sync('**/package.json', { root, ignore: ['node_modules/**'] })
    .flatMap((packageJsonPath) => extractInstalledPackages(path.resolve(root, packageJsonPath)));
}

function extractInstalledPackages(packageJsonPath: string): string[] {
  try {
    const { dependencies, devDependencies } = require(packageJsonPath);
    return [...getKeysSafe(dependencies), ...getKeysSafe(devDependencies)];
  } catch {
    return [];
  }
}

function getKeysSafe(object: Object | undefined = {}): string[] {
  return Object.keys(object);
}
