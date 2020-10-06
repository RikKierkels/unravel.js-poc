import path from 'path';
import { Alias } from '../path-config';

type PathResolverOptions = {
  baseUrls: string[];
  alias: Alias[];
};
type PathResolver = (options: PathResolverOptions, modulePath: string) => string | null;

const resolvers: PathResolver[] = [resolvePathFromAlias, resolvePathFromBase];

export function resolve(options: PathResolverOptions, fromPath: string, toPath: string): string | null {
  if (isRelativePath(toPath)) return tryResolvingPath(toPath, [path.dirname(fromPath)]);

  const resolvedPath = resolvers.map((resolver) => resolver(options, toPath)).find((resolvedPath) => resolvedPath);
  return resolvedPath || toPath;
}

function resolvePathFromAlias({ alias }: PathResolverOptions, modulePath: string): string | null {
  const matchingAlias = alias.find(({ pattern }) => modulePath.includes(pattern));

  if (!matchingAlias) return null;

  const modulePathWithoutAlias = modulePath.replace(matchingAlias.pattern, '');
  return tryResolvingPath(toRelativePath(modulePathWithoutAlias), matchingAlias.substitudes);
}

function resolvePathFromBase({ baseUrls }: PathResolverOptions, modulePath: string): string | null {
  return tryResolvingPath(toRelativePath(modulePath), baseUrls);
}

function tryResolvingPath(modulePath: string, paths: string[]): string | null {
  try {
    return require.resolve(modulePath, { paths });
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
