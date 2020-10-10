import { makeResolverForTsConfigs } from './tsconfig';
import { isNotNull } from '../utils';

export type AbsPathResolver = (fromPath: string, toPath: string) => string[];

export type Alias = {
  pattern: string;
  substitutes: string[];
};

const makeAbsPathResolverFns = [makeResolverForTsConfigs];

export async function getAbsPathResolvers(root: string): Promise<AbsPathResolver[]> {
  const resolvers = makeAbsPathResolverFns.flatMap((makeResolvers) => makeResolvers(root));
  return Promise.all(resolvers).then((resolver) => resolver.filter(isNotNull));
}
