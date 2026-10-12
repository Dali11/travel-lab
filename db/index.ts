import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

let pool: Pool | null = null;
let handle: Database | null = null;

export function getDb(): Database {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add a PostgreSQL connection string to .env.local.",
    );
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    });
  }

  if (!handle) {
    handle = drizzle(pool, { schema });
  }

  return handle;
}

export const isDbConfigured = () => Boolean(process.env.DATABASE_URL);
