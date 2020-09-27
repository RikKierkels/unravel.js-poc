import path from 'path';
import builtinModules from 'builtin-modules';

export function resolve(modulePath: string, dependency: string, installedPackages: string[]): string {
  // TODO: Resolve @alias paths
  if (installedPackages.includes(dependency) || builtinModules.includes(dependency)) return dependency;

  // TODO: Resolve absolute paths from root defined in config (ts/js/webpack etc.)
  const paths = isRelative(dependency) ? [path.dirname(modulePath)] : [];

  try {
    return require.resolve(dependency, { paths });
  } catch {
    return dependency;
  }
}

function isRelative([firstChar]: string): boolean {
  return firstChar === '.';
}
