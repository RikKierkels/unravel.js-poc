import * as glob from 'glob';
import * as path from 'path';

export default function x(root: string) {
  return glob
    .sync('**/?(t|j)sconfig.json', { root, ignore: ['node_modules/**'] })
    .map((configPath) => path.resolve(root, configPath));
}
