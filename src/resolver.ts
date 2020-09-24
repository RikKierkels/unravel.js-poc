import { dirname, join } from 'path';

export function resolve(filePath: string, dependency: string): string {
  try {
    require.resolve(dependency);
    return dependency;
  } catch {
    return resolveRelativeTo(filePath, dependency);
  }
}

function resolveRelativeTo(path: string, otherPath: string): string {
  return join(dirname(path), otherPath);
}
