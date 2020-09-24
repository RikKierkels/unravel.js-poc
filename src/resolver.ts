import path from 'path';

export function resolve(modulePath: string, dependency: string): string {
  const isPackageModule = !isAbsolute(dependency) && !isRelative(dependency);
  return isPackageModule ? dependency : resolveRelativeTo(modulePath, dependency);
}

function isAbsolute(modulePath: string): boolean {
  return path.resolve(modulePath) === path.normalize(modulePath);
}

function isRelative([firstChar]: string): boolean {
  // TODO: Determine edge cases
  return firstChar === '.';
}

function resolveRelativeTo(modulePath: string, otherModulePath: string): string {
  return path.join(path.dirname(modulePath), otherModulePath);
}
