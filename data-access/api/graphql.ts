import { createHandler } from 'graphql-http/lib/use/express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from '../src/graphql/schema.ts';
import { resolvers } from '../src/graphql/resolvers.ts';
import { getDb } from '../src/db/mongo-client.ts';

let mongoDbPromise: Promise<any> | null = null;

export const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

export default async function handler(req: any, res: any) {
    if (!mongoDbPromise) {
        mongoDbPromise = getDb();
    }
    
    const mongoDb = await mongoDbPromise;


    const graphqlHandler = createHandler({
        schema,
        context: () => ({ mongoDb }),
    });

    return graphqlHandler(req, res, () => {});
}