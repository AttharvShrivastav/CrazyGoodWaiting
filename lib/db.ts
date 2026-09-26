import { Pool } from "pg";

const globalForPostgres = globalThis as typeof globalThis & {
  waitlistPool?: Pool;
};

export function getPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalForPostgres.waitlistPool) {
    globalForPostgres.waitlistPool = new Pool({
      connectionString,
      max: 3,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 5_000,
    });
  }

  return globalForPostgres.waitlistPool;
}
