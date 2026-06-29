import { makeExecutableSchema } from '@graphql-tools/schema';
import { resolvers } from '../graphql/resolvers.js';
import path from 'node:path';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';


const schema = loadSchemaSync(
  path.resolve(process.cwd(), 'src/graphql/schema/**/*.graphql'),
  {
    loaders: [new GraphQLFileLoader()],
  }
);

export async function buildSchema() {

  console.log('TYPEDEFS:', schema);
  console.log('RESOLVERS:', resolvers);

  return makeExecutableSchema({
    typeDefs: schema,
    resolvers,
  });
}
