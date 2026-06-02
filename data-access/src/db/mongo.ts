import { MongoClient, ServerApiVersion } from 'mongodb';

export function createMongoClientFromEnv() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI must be set');
  }

  return new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true
    }
  });
}

export async function connectMongoFromEnv() {
  const client = createMongoClientFromEnv();
  await client.connect();
  await client.db('admin').command({ ping: 1 });
  console.log('Pinged your deployment. You successfully connected to MongoDB!');
  return { client };
}

export function getMongoDbFromEnv(client: MongoClient) {
  const dbName = process.env.DB_NAME || 'greenlight';
  return client.db(dbName);
}