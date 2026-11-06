import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import * as authSchema from "./auth.schema.js";

import { env } from "../../platform/config/env.js";
import { db } from "../../platform/database/client.js";

if (!env.BETTER_AUTH_SECRET || !env.BETTER_AUTH_URL) {
  throw new Error("Better Auth configuration is missing");
}

export const auth = betterAuth({
  appName: "TicketFlow",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),

  emailAndPassword: {
    enabled: true,
  },
});
