import { randomUUID } from "node:crypto";
import type { Express } from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { startTestDatabase, type TestDatabase } from "../../helpers/test-database.js";

describe("Better Auth integration", () => {
  let database: TestDatabase | undefined;
  let app: Express | undefined;

  beforeAll(async () => {
    database = await startTestDatabase();

    // Configure the application before importing it.
    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = database.connectionString;
    process.env.BETTER_AUTH_SECRET = "ticketflow-integration-test-secret-0123456789";
    process.env.BETTER_AUTH_URL = "http://localhost:3000";

    const application = await import("../../../src/app.js");
    app = application.app;
  });

  afterAll(async () => {
    try {
      if (app) {
        const { pool } = await import("../../../src/platform/database/client.js");

        await pool.end();
      }
    } finally {
      await database?.stop();
    }
  });

  it("registers a user with email and password", async () => {
    if (!app) {
      throw new Error("Test application was not initialized");
    }

    const email = `test-${randomUUID()}@example.com`;

    const response = await request(app)
      .post("/api/auth/sign-up/email")
      .set("Origin", "http://localhost:3000")
      .send({
        name: "TicketFlow Test",
        email,
        password: "StrongPassword123!",
      })
      .expect(200);

    expect(response.body.user).toMatchObject({
      name: "TicketFlow Test",
      email,
    });

    expect(response.body.user.id).toBeDefined();

    // Verify actual PostgreSQL persistence.
    const { pool } = await import("../../../src/platform/database/client.js");

    const result = await pool.query<{ id: string; email: string }>(
      'SELECT id, email FROM "user" WHERE email = $1',
      [email],
    );

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.id).toBe(response.body.user.id);
  });

  it("signs in, retrieves the session, and signs out", async () => {
    if (!app) {
      throw new Error("Test application was not initialized");
    }

    const email = `session-${randomUUID()}@example.com`;
    const password = "StrongPassword123!";
    const origin = "http://localhost:3000";

    // Register a test user.
    const registration = await request(app)
      .post("/api/auth/sign-up/email")
      .set("Origin", origin)
      .send({
        name: "Session Test",
        email,
        password,
      })
      .expect(200);

    const userId = registration.body.user.id;

    // Use a fresh agent to ensure login actually authenticates.
    const agent = request.agent(app);

    const signIn = await agent
      .post("/api/auth/sign-in/email")
      .set("Origin", origin)
      .send({ email, password })
      .expect(200);

    expect(signIn.body.user.id).toBe(userId);

    // The agent automatically retains authentication cookies.
    const sessionResponse = await agent.get("/api/auth/get-session").expect(200);

    expect(sessionResponse.body.user).toMatchObject({
      id: userId,
      email,
    });

    expect(sessionResponse.body.session.id).toBeDefined();

    // Revoke the authenticated session.
    await agent.post("/api/auth/sign-out").set("Origin", origin).send({}).expect(200);

    // The revoked session must no longer authenticate.
    const afterSignOut = await agent.get("/api/auth/get-session").expect(200);

    expect(afterSignOut.body?.session ?? null).toBeNull();
  });
});
