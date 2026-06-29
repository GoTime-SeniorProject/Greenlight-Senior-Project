import { makeExecutableSchema } from '@graphql-tools/schema';
import { resolvers } from '../graphql/resolvers.js';
import { typeDefs } from '../graphql/schema/schema.js';

export async function buildSchema() {

  console.log('TYPEDEFS:', typeDefs);
  console.log('RESOLVERS:', resolvers);

  return makeExecutableSchema({
    typeDefs: typeDefs,
    resolvers: resolvers,
  });
}
