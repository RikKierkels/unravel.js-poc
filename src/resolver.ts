import path from 'path';
import builtinModules from 'builtin-modules';

export function resolve(modulePath: string, dependency: string): string {
  if (isBuiltInModuleOrPackageDependency(dependency)) return dependency;

  try {
    return require.resolve(dependency, { paths: [path.dirname(modulePath)] });
  } catch {
    console.log(path.resolve(dependency));
    return dependency;
  }
}

function isBuiltInModule(module: string) {
  return builtinModules.includes(module);
}

function isBuiltInModuleOrPackageDependency(module: string): boolean {
  return !isAbsolute(module) && !isRelative(module);
}

function isAbsolute(module: string): boolean {
  return path.resolve(module) === path.normalize(module);
}

function isRelative([firstChar]: string): boolean {
  return firstChar === '.';
}
