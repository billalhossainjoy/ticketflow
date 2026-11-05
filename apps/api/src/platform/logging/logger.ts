import pino from "pino";

export const logger = pino({
  name: "ticketflow-api",
  level: "info",

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
