import path from 'path';
import builtinModules from 'builtin-modules';
import { Alias, PathConfig } from './path-config';

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

// TODO: Is dot a valid first character for a path alias?
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

function resolveAbsoluteModuleWithAlias(module: string, { pattern, substitudes }: Alias): string {
  // TODO: Refactor
  module = module.replace(pattern, '').replace('/', './');

  return tryToResolveModule(module, substitudes);
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
