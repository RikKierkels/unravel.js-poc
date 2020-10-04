import path from 'path';
import builtinModules from 'builtin-modules';
import { PathAlias, PathConfig } from './path-config';

export function resolve(
  installedPackages: string[],
  configPaths: PathConfig[],
  sourceModule: string,
  targetModule: string,
): string {
  if ([...installedPackages, ...builtinModules].includes(targetModule)) return targetModule;

  return isRelative(targetModule)
    ? resolveRelativeModule(targetModule, sourceModule)
    : resolveAbsoluteModule(targetModule, configPaths);
}

function isRelative([firstChar]: string): boolean {
  return firstChar === '.';
}

function resolveRelativeModule(targetModule: string, sourceModule: string): string {
  return tryToResolveModule(targetModule, [path.dirname(sourceModule)]);
}

function resolveAbsoluteModule(module: string, configPaths: PathConfig[]) {
  const baseUrls = configPaths.map(({ baseUrl }) => baseUrl);
  const aliases = configPaths.flatMap(({ aliases }) => aliases);
  const alias = aliases.find(({ alias }) => module.includes(alias));

  return alias ? resolveAbsoluteModuleWithAlias(module, alias) : resolveAbsoluteModuleWithBaseUrl(module, baseUrls);
}

function resolveAbsoluteModuleWithAlias(module: string, { alias, paths }: PathAlias): string {
  // TODO: Refactor
  module = module.replace(alias, '').replace('/', './');

  return tryToResolveModule(module, paths);
}

function resolveAbsoluteModuleWithBaseUrl(module: string, baseUrls: string[]): string {
  // TODO: Refactor
  return tryToResolveModule(`./${module}`, baseUrls);
}

function tryToResolveModule(module: string, paths: string[]): string {
  try {
    return require.resolve(module, { paths });
  } catch (e) {
    console.log(e);
    return module;
  }
}
