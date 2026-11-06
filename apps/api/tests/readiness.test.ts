import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCheckReadiness } = vi.hoisted(() => ({
  mockCheckReadiness: vi.fn(),
}));

vi.mock("../src/platform/database/readiness.js", () => ({
  checkDatabaseReadiness: mockCheckReadiness,
}));

import { app } from "../src/app.js";

beforeEach(() => {
  mockCheckReadiness.mockReset();
});

describe("Health endpoints", () => {
  it("returns 200 for liveness", async () => {
    const response = await request(app).get("/health/live").expect(200);

    expect(response.body).toEqual({
      status: "ok",
    });
  });

  it("returns 200 when the database is ready", async () => {
    mockCheckReadiness.mockResolvedValueOnce(true);

    const response = await request(app).get("/health/ready").expect(200);

    expect(response.body).toEqual({
      status: "ready",
    });

    expect(mockCheckReadiness).toHaveBeenCalledOnce();
  });

  it("returns 503 when the database is unavailable", async () => {
    mockCheckReadiness.mockResolvedValueOnce(false);

    const response = await request(app).get("/health/ready").expect(503);

    expect(response.body).toEqual({
      status: "not_ready",
    });
  });
});
