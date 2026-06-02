import { loadFiles } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { resolvers } from '../graphql/resolvers.js';

export async function buildSchema() {
  const typesArray = await loadFiles('./src/graphql/schema/**/*.graphql');
  const typeDefs = mergeTypeDefs(typesArray);
  return makeExecutableSchema({ typeDefs, resolvers });
}
