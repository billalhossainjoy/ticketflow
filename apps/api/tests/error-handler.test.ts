import express from "express";
import status from "http-status";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../src/app.js";
import { AppError } from "../src/platform/errors/app-error.js";
import { errorHandler } from "../src/platform/errors/error-handler.js";
import { httpLogger } from "../src/platform/logging/http-logger.js";
import { z } from "zod";

const errorTestApp = express();

errorTestApp.use(httpLogger);
errorTestApp.use(express.json());

errorTestApp.post("/validation-error", (req) => {
  z.object({
    email: z.email(),
  }).parse(req.body);
});

errorTestApp.get("/expected-error", () => {
  throw new AppError(status.NOT_FOUND, "resource_not_found", "Resource not found");
});

errorTestApp.get("/unexpected-error", () => {
  throw new Error("Sensitive internal database information");
});

errorTestApp.use(errorHandler);

describe("API error handling", () => {
  it("returns 400 for malformed JSON", async () => {
    const response = await request(app)
      .post("/health/live")
      .set("Content-Type", "application/json")
      .send('{"name":}')
      .expect(400);

    expect(response.headers["content-type"]).toMatch(/application\/problem\+json/);

    expect(response.body).toMatchObject({
      type: "about:blank",
      status: 400,
      code: "invalid_json",
      detail: "Invalid JSON request body.",
      requestId: response.headers["x-request-id"],
    });
  });

  it("returns 413 for oversized request bodies", async () => {
    const response = await request(app)
      .post("/health/live")
      .send({ content: "a".repeat(110_000) })
      .expect(413);

    expect(response.body).toMatchObject({
      status: 413,
      code: "payload_too_large",
    });
  });

  it("returns expected application errors", async () => {
    const response = await request(errorTestApp).get("/expected-error").expect(404);

    expect(response.body).toMatchObject({
      type: "about:blank",
      status: 404,
      code: "resource_not_found",
      detail: "Resource not found",
      requestId: response.headers["x-request-id"],
    });
  });

  it("hides unexpected internal errors", async () => {
    const response = await request(errorTestApp).get("/unexpected-error").expect(500);

    expect(response.body).toMatchObject({
      status: 500,
      code: "internal_error",
      detail: "An unexpected error occurred.",
    });

    expect(JSON.stringify(response.body)).not.toContain("Sensitive internal database information");
  });
});

describe("Unknown API routes", () => {
  it("returns a standardized 404 response", async () => {
    const response = await request(app).get("/api/v1/unknown").expect(404);

    expect(response.headers["content-type"]).toMatch(/application\/problem\+json/);

    expect(response.body).toMatchObject({
      type: "about:blank",
      status: 404,
      code: "route_not_found",
      detail: "The requested endpoint does not exist.",
      requestId: response.headers["x-request-id"],
    });
  });
});

describe("RFC 9457 Problem Details", () => {
  it("returns a compliant 404 problem response", async () => {
    const response = await request(app).get("/api/v1/nonexistent").expect(404);

    const requestId = response.headers["x-request-id"];

    expect(response.headers["content-type"]).toMatch(/application\/problem\+json/);

    expect(response.body).toEqual({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: "The requested endpoint does not exist.",
      instance: `urn:uuid:${requestId}`,
      requestId,
      code: "route_not_found",
    });
  });

  it("returns a compliant 500 problem without leaking details", async () => {
    const response = await request(errorTestApp).get("/unexpected-error").expect(500);

    const requestId = response.headers["x-request-id"];

    expect(response.headers["content-type"]).toMatch(/application\/problem\+json/);

    expect(response.body).toEqual({
      type: "about:blank",
      title: "Internal Server Error",
      status: 500,
      detail: "An unexpected error occurred.",
      instance: `urn:uuid:${requestId}`,
      requestId,
      code: "internal_error",
    });

    expect(JSON.stringify(response.body)).not.toContain("Sensitive internal database information");
  });
});

describe("Zod validation errors", () => {
  it("returns RFC 9457 Problem Details for invalid input", async () => {
    const response = await request(errorTestApp)
      .post("/validation-error")
      .send({ email: "invalid-email" })
      .expect(400);

    const requestId = response.headers["x-request-id"];

    expect(response.headers["content-type"]).toMatch(/application\/problem\+json/);

    expect(response.body).toEqual({
      type: "about:blank",
      title: "Bad Request",
      status: 400,
      detail: "Request validation failed.",
      instance: `urn:uuid:${requestId}`,
      requestId,
      code: "validation_error",
    });

    expect(JSON.stringify(response.body)).not.toContain("invalid-email");
  });
});
