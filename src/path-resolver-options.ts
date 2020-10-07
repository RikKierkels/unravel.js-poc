import * as glob from 'glob';
import * as path from 'path';
import { TsConfigOptions } from 'ts-node';
import { isNotNull, readJson } from './utils';

export type PathResolverOptions = {
  baseUrls: string[];
  alias: Alias[];
};

export type Alias = {
  pattern: string;
  substitutes: string[];
};

type CompilerOptions = {
  baseUrl: string;
  paths: { [key: string]: string[] };
};
type TsConfig = TsConfigOptions & { compilerOptions: CompilerOptions };

const optionsResolvers = [getOptionsFromTsConfigs];

export async function getPathResolverOptions(root: string): Promise<PathResolverOptions> {
  const options = optionsResolvers.flatMap((resolver) => resolver(root));

  return Promise.all(options)
    .then((options) => options.filter(isNotNull))
    .then((options) => ({
      baseUrls: options.flatMap(({ baseUrls }) => baseUrls),
      alias: options.flatMap(({ alias }) => alias),
    }));
}

function getOptionsFromTsConfigs(root: string): Promise<PathResolverOptions | null>[] {
  return glob
    .sync('**/@(t|j)sconfig.json', { root, ignore: ['node_modules/**'] })
    .map((configPath) => path.resolve(root, configPath))
    .map(getOptionsFromTsConfig);
}

function getOptionsFromTsConfig(configPath: string): Promise<PathResolverOptions | null> {
  return readJson<TsConfig>(configPath).then(
    ({ compilerOptions }) => resolveOptionsFromConfig(configPath, compilerOptions),
    () => null,
  );
}

function resolveOptionsFromConfig(configPath: string, { baseUrl, paths }: CompilerOptions): PathResolverOptions | null {
  if (!baseUrl) return null;

  const absoluteBaseUrl = toAbsolutePathFromDir(configPath, baseUrl);

  return {
    baseUrls: [absoluteBaseUrl],
    alias: Object.keys(paths).map((pattern) => ({
      pattern,
      substitutes: paths[pattern].map((substitute) => path.resolve(absoluteBaseUrl, substitute)),
    })),
  };
}

function toAbsolutePathFromDir(fromPath: string, toPath: string): string {
  return path.resolve(path.dirname(fromPath), toPath);
}
