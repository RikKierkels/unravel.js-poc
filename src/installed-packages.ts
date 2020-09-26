import * as glob from 'glob';
import * as path from 'path';

export function getInstalledPackages(root: string): string[] {
  return glob
    .sync('**/package.json', { root, ignore: ['node_modules/**'] })
    .flatMap((packagePath) => extractInstalledPackages(path.resolve(root, packagePath)));
}

function extractInstalledPackages(packagePath: string): string[] {
  try {
    const { dependencies, devDependencies } = require(packagePath);
    return [...getKeysSafe(dependencies), ...getKeysSafe(devDependencies)];
  } catch {
    return [];
  }
}

function getKeysSafe(object: Object | undefined = {}): string[] {
  return Object.keys(object);
}
