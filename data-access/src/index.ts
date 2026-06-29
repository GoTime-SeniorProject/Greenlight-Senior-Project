import dotenv from 'dotenv';
import path from 'node:path';
import { buildSchema } from './init/schema.js';
import { startExample } from './server.local.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const schema = await buildSchema();

  // ✅ Only run local Express server when NOT on Vercel
  const isVercel = !!process.env.VERCEL;

  if (isVercel) {
    console.log('Running in Vercel — skipping local server startup');
    return;
  }

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