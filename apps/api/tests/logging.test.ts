import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";

describe("HTTP logging middleware", () => {
  it("should attach a request ID to successful responses", async () => {
    const response = await request(app).get("/health/live").expect(200);

    expect(response.headers["x-request-id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("should generate unique request IDs", async () => {
    const first = await request(app).get("/health/live");
    const second = await request(app).get("/health/live");

    expect(first.headers["x-request-id"]).toBeDefined();
    expect(second.headers["x-request-id"]).toBeDefined();

    expect(first.headers["x-request-id"]).not.toBe(second.headers["x-request-id"]);
  });

  it("should attach a request ID to 404 responses", async () => {
    const response = await request(app).get("/not-found").expect(404);

    expect(response.headers["x-request-id"]).toBeDefined();
  });
});
