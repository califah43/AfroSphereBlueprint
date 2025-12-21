import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

const databaseUrl = process.env.DATABASE_URL;

let db: any = null;

if (databaseUrl) {
  const client = postgres(databaseUrl, { prepare: false });
  db = drizzle(client, { schema });
}

export { db };
