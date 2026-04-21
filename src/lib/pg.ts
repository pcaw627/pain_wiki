import type { QueryResultRow } from "pg";
import { Pool } from "pg";

function getConnectionString() {
  const raw =
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    "";

  // Some hosted Postgres URLs include ssl/sslmode params that cause the pg driver
  // to ignore our explicit TLS settings (or to verify when we don't want it to).
  // We strip those and control TLS via the `ssl` option below.
  try {
    const url = new URL(raw);
    // Strip *all* query params (pooler hints, sslmode, etc). We'll control TLS via `ssl`.
    url.search = "";
    return url.toString();
  } catch {
    return raw;
  }
}

declare global {
  var __painWikiPool: Pool | undefined;
}

export function getPool() {
  if (globalThis.__painWikiPool) return globalThis.__painWikiPool;

  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error("Missing POSTGRES_URL (or POSTGRES_URL_NON_POOLING) environment variable");
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  globalThis.__painWikiPool = pool;
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: unknown[]
) {
  const pool = getPool();
  return pool.query<T>(text, values as any);
}

