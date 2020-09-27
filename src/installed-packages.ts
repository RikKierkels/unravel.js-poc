import * as glob from 'glob';
import * as path from 'path';
import { Maybe } from './detect';

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

function getKeysSafe(object: Maybe<Object>): string[] {
  return Object.keys(object || {});
}
