import http from 'http';
import { createHandler } from 'graphql-http/lib/use/express';
import express from 'express';
import { ruruHTML } from 'ruru/server';
import { createPoolFromEnv } from './db/pool.js';
import { connectMongoFromEnv, getMongoDbFromEnv } from './db/mongo.js';

export async function startExample(schema: any) {
  const app = express();
  const pool = await createPoolFromEnv();
  const mongo = await connectMongoFromEnv();
  const graphqlPath = '/graphql';

  app.get('/', (_req, res) => {
    res.redirect(graphqlPath);
  });

  app.get(graphqlPath, (_req, res) => {
    res.type('html').send(ruruHTML({ endpoint: graphqlPath }));
  });

  app.all(
    graphqlPath,
    createHandler({
      schema,
      context: () => ({ pool, mongoDb: getMongoDbFromEnv(mongo.client) })
    })
  );

  const server = http.createServer(app);
  const port = process.env.PORT || '7071';
  return new Promise<http.Server>((resolve) => {
    server.listen(parseInt(port, 10), () => {
      // eslint-disable-next-line no-console
      console.log(`GraphQL server running at http://localhost:${port}/graphql`);
      resolve(server);
    });
  });
}
