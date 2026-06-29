import dotenv from 'dotenv';
import path from 'node:path';
import { buildSchema } from './init/schema.js';
import { startExample } from './server.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const schema = await buildSchema();
  const server = await startExample(schema);

  const shutdown = async () => {
    server.close();
  };

  process.once('SIGINT', () => void shutdown());
  process.once('SIGTERM', () => void shutdown());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
