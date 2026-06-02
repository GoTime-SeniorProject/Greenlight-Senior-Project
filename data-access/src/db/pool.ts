import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

type PoolConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

function parseDatabaseUrl(url: string): PoolConfig {
  const match = url.match(/mysql:\/\/(.*?):(.*?)@(.*?)(?::(\d+))?\/(.*)/);
  if (!match) {
    throw new Error('DATABASE_URL must be in mysql://user:pass@host:port/db format');
  }
  const [, user, password, host, port, database] = match;
  return {
    host,
    port: port ? Number(port) : 3306,
    user,
    password,
    database
  };
}

async function configFromEnv(): Promise<PoolConfig> {
  if (process.env.DATABASE_URL) {
    return parseDatabaseUrl(process.env.DATABASE_URL);
  }
  const htaccess = await loadHtaccessEnv();
  const host = process.env.DB_SERVER || htaccess.DB_SERVER || 'localhost';
  const user = process.env.DB_USERNAME || htaccess.DB_USERNAME || '';
  const password = process.env.DB_PASSWORD || htaccess.DB_PASSWORD || '';
  const database = process.env.DB_NAME || htaccess.DB_NAME || '';
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
  if (!user || !database) {
    throw new Error('DB_USERNAME and DB_NAME must be set when DATABASE_URL is not provided');
  }
  return { host, port, user, password, database };
}

export async function createPoolFromEnv() {
  const config = await configFromEnv();
  return mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true
  });
}

async function loadHtaccessEnv(): Promise<Record<string, string>> {
  try {
    const htaccessPath = path.resolve(process.cwd(), '..', '.htaccess');
    const contents = await readFile(htaccessPath, 'utf8');
    const out: Record<string, string> = {};
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*SetEnv\s+(DB_[A-Z_]+)\s+(.+?)\s*$/);
      if (match) {
        out[match[1]] = match[2];
      }
    }
    return out;
  } catch {
    return {};
  }
}
