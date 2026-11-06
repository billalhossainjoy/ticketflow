import { env } from "../config/env.js";

export async function checkDatabaseReadiness(): Promise<boolean> {
  if (!env.DATABASE_URL) {
    return false;
  }

  try {
    const { pool } = await import("./client.js");
    await pool.query("SELECT 1");

    return true;
  } catch {
    return false;
  }
}
