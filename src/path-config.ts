import * as glob from 'glob';
import * as path from 'path';
import { readJson } from './utils';

export type PathConfig = {
  baseUrl: string;
  aliases: Alias[];
};

export type Alias = {
  pattern: string;
  substitudes: string[];
};

export default async function getPathConfigs(root: string): Promise<PathConfig[]> {
  return Promise.all(
    glob
      .sync('**/@(t|j)sconfig.json', { root, ignore: ['node_modules/**'] })
      .map((configPath) => path.resolve(root, configPath))
      .map(extractPaths),
  ).then((configs) => configs.filter((config) => config.baseUrl));
}

// TODO: Future version of Typescript will make paths work without a base url.
async function extractPaths(configPath: string): Promise<PathConfig> {
  return readJson(configPath).then(
    ({ compilerOptions: { baseUrl = '', paths = [] } = {} }) => {
      // TODO: Refactor
      baseUrl = path.resolve(path.dirname(configPath), baseUrl);

      return {
        baseUrl,
        aliases: resolveAliases(baseUrl, paths),
      };
    },
    () => ({ baseUrl: '', aliases: [] }),
  );
}

function resolveAliases(baseUrl: string, paths: { [key: string]: string[] }): Alias[] {
  return Object.keys(paths).map((alias) => ({
    pattern: alias,
    substitudes: paths[alias].map((p) => path.resolve(baseUrl, p)),
  }));
}
