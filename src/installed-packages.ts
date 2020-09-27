import * as glob from 'glob';
import * as path from 'path';
import { Maybe } from './detect';

export function getInstalledPackages(root: string): string[] {
  return glob
    .sync('**/package.json', { root, ignore: ['node_modules/**'] })
    .map((packageJsonPath) => path.resolve(root, packageJsonPath))
    .flatMap(extractInstalledPackages);
}

function extractInstalledPackages(packageJsonPath: string): string[] {
  try {
    const { dependencies, devDependencies } = require(packageJsonPath);
    return [...keys(dependencies), ...keys(devDependencies)];
  } catch {
    return [];
  }
}

function keys(object: Maybe<Object>): string[] {
  return Object.keys(object || {});
}
