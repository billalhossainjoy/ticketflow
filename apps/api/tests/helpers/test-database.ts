import { fileURLToPath } from "node:url";

import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const migrationsFolder = fileURLToPath(new URL("../../drizzle/", import.meta.url));

export interface TestDatabase {
  connectionString: string;
  stop(): Promise<void>;
}

export async function startTestDatabase(): Promise<TestDatabase> {
  const container = await new PostgreSqlContainer("postgres:17-alpine")
    .withDatabase("ticketflow_test")
    .start();

  const pool = new Pool({
    connectionString: container.getConnectionUri(),
  });

  try {
    const db = drizzle({ client: pool });

    await migrate(db, { migrationsFolder });
  } catch (error) {
    await pool.end().catch(() => undefined);
    await container.stop();
    throw error;
  }

  await pool.end();

  return {
    connectionString: container.getConnectionUri(),
    stop: async () => {
      await container.stop();
    },
  };
}
