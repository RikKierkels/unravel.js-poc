import * as glob from 'glob';
import path from 'path';
import { TsConfigOptions } from 'ts-node';
import { readJson, toAbsolutePathFromDir, toPosixPath } from '../utils';
import { AbsPathResolver, Alias } from '../path-resolver-options';

type CompilerOptions = {
  baseUrl: string;
  paths: { [key: string]: string[] };
};
type TsConfig = TsConfigOptions & { compilerOptions: CompilerOptions };

export function makeResolverForTsConfigs(root: string): Promise<AbsPathResolver | null>[] {
  return glob
    .sync('**/@(t|j)sconfig.json', { root, ignore: ['node_modules/**'] })
    .map((configPath) => path.resolve(root, configPath))
    .map(makeResolverForTsConfig);
}

async function makeResolverForTsConfig(configPath: string): Promise<AbsPathResolver | null> {
  const { compilerOptions } = await readJson<TsConfig>(configPath);

  if (!compilerOptions?.baseUrl) return null;

  const [baseUrl, alias] = normalizeOptions(configPath, compilerOptions);
  return makePathResolverFn(baseUrl, alias);
}

// TODO: Check posix absolute base url
function normalizeOptions(configPath: string, { baseUrl, paths }: CompilerOptions): [string, Alias[]] {
  const absoluteBaseUrl = toAbsolutePathFromDir(configPath, baseUrl);
  const alias = Object.keys(paths).map((pattern) => ({
    pattern,
    substitutes: paths[pattern].map((substitute) => path.resolve(absoluteBaseUrl, substitute)).map(toPosixPath),
  }));

  return [absoluteBaseUrl, alias];
}

function makePathResolverFn(baseUrl: string, alias: Alias[]): AbsPathResolver {
  const hasMatchAllPattern = alias.some(({ pattern }) => isMatchAllPattern(pattern));

  if (!hasMatchAllPattern) {
    alias.push({ pattern: '*', substitutes: [toPathWithStarPostfix(baseUrl)] });
  }

  // Sorting for when a module matches with multiple patterns, take the pattern with the longest prefix.
  alias = alias.sort((a, b) => getLengthOfStarPrefix(b.pattern) - getLengthOfStarPrefix(a.pattern));

  return (fromPath, toPath) =>
    alias.flatMap(({ pattern, substitutes }) => {
      const match = pattern === toPath ? '' : matchStar(pattern, toPath);

      if (match === null) return [];

      return substitutes.map((substitute) => substitute.replace('*', match));
    });
}

function isMatchAllPattern(pattern: string): boolean {
  return pattern === '*';
}

function getLengthOfStarPrefix(pattern: string): number {
  const indexOfStar = pattern.indexOf('*');
  return pattern.substr(0, indexOfStar).length;
}

function toPathWithStarPostfix(modulePath: string): string {
  return `${modulePath.replace(/\/$/, '')}/*`;
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
