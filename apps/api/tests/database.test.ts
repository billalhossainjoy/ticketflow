import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockEnv, mockPool } = vi.hoisted(() => ({
  mockEnv: {
    DATABASE_URL: "postgresql://localhost:5432/ticketflow" as string | undefined,
  },
  mockPool: {
    query: vi.fn(),
    end: vi.fn(),
  },
}));

vi.mock("../src/platform/config/env.js", () => ({
  env: mockEnv,
}));

vi.mock("../src/platform/database/client.js", () => ({
  pool: mockPool,
}));

import { closeDatabaseConnections } from "../src/platform/database/lifecycle.js";
import { checkDatabaseReadiness } from "../src/platform/database/readiness.js";

beforeEach(() => {
  vi.resetAllMocks();
  mockEnv.DATABASE_URL = "postgresql://localhost:5432/ticketflow";
});

describe("Database readiness", () => {
  it("returns true when PostgreSQL responds", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{ "?column?": 1 }] });

    await expect(checkDatabaseReadiness()).resolves.toBe(true);
    expect(mockPool.query).toHaveBeenCalledWith("SELECT 1");
  });

  it("returns false when PostgreSQL is unavailable", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("Connection refused"));

    await expect(checkDatabaseReadiness()).resolves.toBe(false);
  });

  it("returns false when DATABASE_URL is missing", async () => {
    mockEnv.DATABASE_URL = undefined;

    await expect(checkDatabaseReadiness()).resolves.toBe(false);
    expect(mockPool.query).not.toHaveBeenCalled();
  });
});

describe("Database lifecycle", () => {
  it("closes the connection pool", async () => {
    mockPool.end.mockResolvedValueOnce(undefined);

    await closeDatabaseConnections();

    expect(mockPool.end).toHaveBeenCalledOnce();
  });

  it("does not initialize the pool without DATABASE_URL", async () => {
    mockEnv.DATABASE_URL = undefined;

    await closeDatabaseConnections();

    expect(mockPool.end).not.toHaveBeenCalled();
  });

  it("propagates shutdown failures", async () => {
    mockPool.end.mockRejectedValueOnce(new Error("Pool shutdown failed"));

    await expect(closeDatabaseConnections()).rejects.toThrow("Pool shutdown failed");
  });
});
