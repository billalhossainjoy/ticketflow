import { env } from "../config/env.js";

export async function closeDatabaseConnections(): Promise<void> {
  if (!env.DATABASE_URL) {
    return;
  }

  const { pool } = await import("./client.js");

  await pool.end();
}
