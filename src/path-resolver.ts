import { isNotNull, isRelativePath, toAbsolutePathFromDir } from './utils';
import { AbsPathResolver } from './path-resolver-options';

export function resolve(absPathResolvers: AbsPathResolver[], fromPath: string, toPath: string): string {
  if (isRelativePath(toPath)) {
    return tryToResolvePath(toAbsolutePathFromDir(fromPath, toPath)) || ''; // TODO: This should actually return null if path not resolved
  }

  const resolvedPaths = absPathResolvers
    .flatMap((resolver) => resolver(fromPath, toPath))
    .map(tryToResolvePath)
    .filter(isNotNull);

  return resolvedPaths[resolvedPaths.length - 1] || toPath;
}

function tryToResolvePath(modulePath: string): string | null {
  try {
    return require.resolve(modulePath);
  } catch {
    return null;
  }
}
