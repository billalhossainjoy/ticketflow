import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { startTestDatabase, type TestDatabase } from "../helpers/test-database.js";

describe("PostgreSQL integration setup", () => {
  let database: TestDatabase;

  beforeAll(async () => {
    database = await startTestDatabase();
  });

  afterAll(async () => {
    await database?.stop();
  });

  it("applies the Better Auth migrations", async () => {
    const pool = new Pool({
      connectionString: database.connectionString,
    });

    try {
      const result = await pool.query<{ table_name: string }>(
        `
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = ANY($1::text[])
          ORDER BY table_name
        `,
        [["account", "session", "user", "verification"]],
      );

      expect(result.rows.map((row) => row.table_name)).toEqual([
        "account",
        "session",
        "user",
        "verification",
      ]);
    } finally {
      await pool.end();
    }
  });
});
