import * as glob from 'glob';
import * as path from 'path';
import readJsonFile from './json';

type PathConfig = {
  baseUrl: string;
  aliases: PathAlias[];
};

type PathAlias = {
  alias: string;
  paths: string[];
};

export default async function x(root: string): Promise<PathConfig[]> {
  return Promise.all(
    glob
      .sync('**/@(t|j)sconfig.json', { root, ignore: ['node_modules/**'] })
      .map((configPath) => path.resolve(root, configPath))
      .map(extractPaths),
  ).then((configs) => configs.filter((config) => config.baseUrl));
}

// TODO: Future version of Typescript will make paths work without a base url.
async function extractPaths(configPath: string): Promise<PathConfig> {
  return readJsonFile(configPath).then(
    ({ compilerOptions: { baseUrl = '', paths = [] } = {} }) => ({
      baseUrl,
      aliases: resolveAliases(baseUrl, paths),
    }),
    () => ({ baseUrl: '', aliases: [] }),
  );
}

function resolveAliases(baseUrl: string, paths: { [key: string]: string[] }): PathAlias[] {
  return Object.keys(paths).map((alias) => ({ alias, paths: paths[alias].map((p) => path.resolve(baseUrl, p)) }));
}
