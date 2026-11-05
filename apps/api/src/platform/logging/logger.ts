import pino from "pino";
import { env } from "../config/env.js";

export const logger = pino({
  name: "ticketflow-api",
  level: env.LOG_LEVEL,

  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "token",
      "*.password",
      "*.token",
    ],
    censor: "[REDACTED]",
  },
});
