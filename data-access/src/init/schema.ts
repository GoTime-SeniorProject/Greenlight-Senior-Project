import { loadFiles } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { resolvers } from '../graphql/resolvers.js';
import path from 'node:path';


export async function buildSchema() {
  const typesArray = await loadFiles(
    path.resolve(process.cwd(), 'src/graphql/schema/**/*.graphql')
  );
  const typeDefs = mergeTypeDefs(typesArray);

  console.log('LOADED TYPEFILES:', typesArray.map(String));
  
  console.log('TYPEDEFS:', typesArray);
  console.log('RESOLVERS:', resolvers);

  return makeExecutableSchema({ typeDefs, resolvers });
}
