import http from 'http';
import cors from 'cors';
import express from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import { ruruHTML } from 'ruru/server';

import { getDb } from './db/mongo-client.js';

export async function startExample(schema: any) {
  const app = express();
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }
    
  ));
  const graphqlPath = '/graphql';

  // Connect to MongoDB once when the server starts
  const mongoDb = await getDb();

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
      context: () => ({
        mongoDb,
      }),
    }),
  );

  const server = http.createServer(app);
  const port = Number(process.env.PORT ?? 7071);

  return new Promise<http.Server>((resolve) => {
    server.listen(port, () => {
      console.log(`GraphQL server running at http://localhost:${port}/graphql`);
      resolve(server);
    });
  });
}