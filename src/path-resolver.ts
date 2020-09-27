import path from 'path';
import builtinModules from 'builtin-modules';

// TODO: Resolve @alias paths
export function resolve(installedPackages: string[], sourceModule: string, targetModule: string): string {
  if ([...installedPackages, ...builtinModules].includes(targetModule)) return targetModule;

  // TODO: Resolve absolute paths from root defined in config (ts/js/webpack etc..)
  const paths = isRelative(targetModule) ? [path.dirname(sourceModule)] : [];

  try {
    return require.resolve(targetModule, { paths });
  } catch {
    return targetModule;
  }
}

function isRelative([firstChar]: string): boolean {
  return firstChar === '.';
}
