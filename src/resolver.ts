import path from 'path';

export function resolve(modulePath: string, dependency: string): string {
  if (isLikelyPackageImport(dependency)) return dependency;

  try {
    return require.resolve(dependency, { paths: [path.dirname(modulePath)] });
  } catch {
    return dependency;
  }
}

// TODO: Rename
function isLikelyPackageImport(modulePath: string): boolean {
  return !isAbsolute(modulePath) && !isRelative(modulePath);
}

function isAbsolute(modulePath: string): boolean {
  return path.resolve(modulePath) === path.normalize(modulePath);
}

function isRelative([firstChar]: string): boolean {
  // TODO: Determine edge cases
  return firstChar === '.';
}
