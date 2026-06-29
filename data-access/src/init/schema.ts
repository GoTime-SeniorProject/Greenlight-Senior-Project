import { makeExecutableSchema } from '@graphql-tools/schema';
import { print } from 'graphql';
import { resolvers } from '../graphql/resolvers.js';
import { typeDefs as rawTypeDefs } from '../graphql/schema/schema.js';

export function buildSchema() {
  const typeDefs = typeof rawTypeDefs === 'string'
    ? rawTypeDefs
    : print(rawTypeDefs);

  return makeExecutableSchema({
    typeDefs,
    resolvers,
  });
}