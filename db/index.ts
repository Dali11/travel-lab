import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * The database handle, built lazily.
 *
 * `neon()` throws when DATABASE_URL is missing, and it used to throw at module
 * scope — so merely importing `@/db` took the whole `next build` down whenever
 * the variable was unset, even though nothing in the public site reads the
 * database. Anything that imports this module to check whether the database is
 * configured could therefore never run.
 *
 * The connection is now created on first use. Importing is free and safe;
 * calling `getDb()` without DATABASE_URL throws a clear, actionable error at
 * the point of use rather than at import time.
 *
 * Usage: `const db = getDb();`
 */
export type Database = ReturnType<typeof drizzle<typeof schema>>;

let handle: Database | null = null;

export function getDb(): Database {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and add a Postgres connection string.",
    );
  }

  if (!handle) {
    handle = drizzle(neon(process.env.DATABASE_URL), { schema });
  }

  return handle;
}

/** Whether the database is configured, without constructing a connection. */
export const isDbConfigured = () => Boolean(process.env.DATABASE_URL);