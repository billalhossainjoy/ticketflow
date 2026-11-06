import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "../config/env.js";
import { logger } from "../logging/logger.js";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to initialize PostgreSQL");
}

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 5,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 30_000,
});

pool.on("error", (error: Error) => {
  logger.error({ err: error }, "Unexpected idle PostgreSQL connection error");
});

export const db = drizzle({ client: pool });
