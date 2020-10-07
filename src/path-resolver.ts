import path from 'path';
import { PathResolverOptions } from './path-resolver-options';

type PathResolver = (options: PathResolverOptions, modulePath: string) => string | null;
const resolvers: PathResolver[] = [resolvePathFromAlias, resolvePathFromBase];

export function resolve(options: PathResolverOptions, fromPath: string, toPath: string): string {
  if (isRelativePath(toPath)) return tryToResolvePath(toPath, [path.dirname(fromPath)]) || ''; // TODO: This should actually return null if path not resolved

  const resolvedPath = resolvers.map((resolver) => resolver(options, toPath)).find((resolvedPath) => resolvedPath);
  return resolvedPath || toPath;
}

function resolvePathFromAlias({ alias }: PathResolverOptions, modulePath: string): string | null {
  const matchingAlias = alias.find(({ pattern }) => modulePath.includes(pattern));

  if (!matchingAlias) return null;

  const modulePathWithoutAlias = modulePath.replace(matchingAlias.pattern, '');
  return tryToResolvePath(toRelativePath(modulePathWithoutAlias), matchingAlias.substitutes);
}

function resolvePathFromBase({ baseUrls }: PathResolverOptions, modulePath: string): string | null {
  return tryToResolvePath(toRelativePath(modulePath), baseUrls);
}

function tryToResolvePath(modulePath: string, paths: string[]): string | null {
  try {
    return require.resolve(modulePath, { paths: paths.map(toPosixPath) });
  } catch {
    return null;
  }
}

function isRelativePath(modulePath: string): boolean {
  return /^\.?\.\//.test(modulePath);
}

function toRelativePath(modulePath: string): string {
  return isRelativePath(modulePath) ? modulePath : `./${modulePath}`;
}

function toPosixPath(modulePath: string): string {
  return modulePath.replace(/\\/g, '/');
}
