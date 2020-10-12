import { isNotNull, isRelativePath, mapToRelativePath, takeLast, toPosixPath } from './utils';
import path from 'path';
import resolve, { SyncOpts } from 'resolve';

const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.json'];

export type PathResolver = (fromPath: string, toPath: string) => string;
export type PathResolverOptions = {
  baseUrl: string;
  alias: Alias[];
};

type Alias = {
  pattern: string;
  substitutes: Substitute[];
};
type Substitute = string | ((match: string) => string);

export function createPathResolver(root: string, options?: PathResolverOptions): PathResolver {
  const normalizedOptions = normalizeOptions(root, options);

  return (fromPath, toPath) => {
    if (isRelativePath(toPath)) {
      // TODO: Actually return null
      return tryToResolvePath(toPath, { basedir: path.dirname(fromPath) }) || '';
    }

    const resolvedPathsFromOptions = tryToResolvePathFromOptions(normalizedOptions, root, fromPath, toPath);
    return takeLast(resolvedPathsFromOptions) ?? toPath;
  };
}

function normalizeOptions(root: string, options?: PathResolverOptions): PathResolverOptions {
  if (!options?.baseUrl) return { baseUrl: '', alias: [] };

  const absoluteBaseUrl = toPosixPath(path.resolve(root, options.baseUrl));
  const alias = options.alias.map(({ pattern, substitutes }) => ({
    pattern,
    substitutes: substitutes.map((substitute) =>
      typeof substitute === 'function' ? substitute : toPosixPath(path.resolve(absoluteBaseUrl, substitute)),
    ),
  }));

  const hasMatchAllPattern = options.alias.some(({ pattern }) => isMatchAllPattern(pattern));
  if (!hasMatchAllPattern) {
    alias.push({ pattern: '*', substitutes: [toPathWithStarPostfix(absoluteBaseUrl)] });
  }

  return {
    baseUrl: absoluteBaseUrl,
    // Sorting to make it more convenient to get the module with the longest prefix in case a module matches with multiple patterns
    alias: alias.sort((a, b) => getLengthOfStarPrefix(b.pattern) - getLengthOfStarPrefix(a.pattern)),
  };
}

function isMatchAllPattern(pattern: string): boolean {
  return pattern === '*';
}

function toPathWithStarPostfix(modulePath: string): string {
  return `${modulePath.replace(/\/$/, '')}/*`;
}

function getLengthOfStarPrefix(pattern: string): number {
  const indexOfStar = pattern.indexOf('*');
  return pattern.substr(0, indexOfStar).length;
}

function tryToResolvePath(
  modulePath: string,
  { basedir, extensions = DEFAULT_EXTENSIONS }: SyncOpts = {},
): string | null {
  try {
    return resolve.sync(modulePath, { basedir, extensions });
  } catch {
    return null;
  }
}

function tryToResolvePathFromOptions(
  { alias }: PathResolverOptions,
  root: string,
  fromPath: string,
  toPath: string,
): string[] {
  return alias
    .flatMap(({ pattern, substitutes }) => {
      const match = pattern === toPath ? '' : matchStar(pattern, toPath);

      if (match === null) return [];

      return substitutes.map((substitute) =>
        typeof substitute === 'function' ? substitute(match) : substitute.replace('*', match),
      );
    })
    .map((absolutePath) => mapToRelativePath(root, fromPath, absolutePath))
    .map((relativePath) => tryToResolvePath(relativePath, { basedir: path.dirname(fromPath) }))
    .filter(isNotNull);
}

function matchStar(pattern: string, modulePath: string): string | null {
  if (modulePath.length < pattern.length) return null;

  if (isMatchAllPattern(pattern)) {
    return modulePath;
  }

  const indexOfStar = pattern.indexOf('*');
  if (indexOfStar === -1) {
    return null;
  }

  const beforeStar = pattern.substring(0, indexOfStar);
  if (modulePath.substr(0, indexOfStar) !== beforeStar) {
    return null;
  }

  const afterStar = pattern.substring(indexOfStar + 1);
  if (modulePath.substr(modulePath.length - afterStar.length) !== afterStar) {
    return null;
  }

  return modulePath.substr(indexOfStar, modulePath.length - afterStar.length);
}
