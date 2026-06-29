import { Db, MongoClient, ServerApiVersion } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

function getMongoClient() {
  if (client) {
    return client;
  }

  const {
    DB_USERNAME,
    DB_PASSWORD,
    DB_HOST,
    DB_APP_NAME,
  } = process.env;

  if (!DB_USERNAME || !DB_PASSWORD || !DB_HOST || !DB_APP_NAME) {
    throw new Error(
      'DB_USERNAME, DB_PASSWORD, DB_HOST, and DB_APP_NAME must be set.'
    );
  }

  const uri = `mongodb+srv://${encodeURIComponent(DB_USERNAME)}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}/?appName=${encodeURIComponent(DB_APP_NAME)}`;

  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  return client;
}

export async function getDb(): Promise<Db> {
  if (db) {
    return db;
  }

  const mongoClient = getMongoClient();

  await mongoClient.connect();
  await mongoClient.db('admin').command({ ping: 1 });

  console.log('Connected to MongoDB Atlas.');

  db = mongoClient.db(process.env.DB_NAME ?? 'greenlight');

  return db;
}

export { getMongoClient };