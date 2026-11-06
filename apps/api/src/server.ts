import { app } from "./app.js";
import { env } from "./platform/config/env.js";
import { logger } from "./platform/logging/logger.js";

const server = app.listen(env.PORT, "0.0.0.0", () => {
  logger.info({ port: env.PORT }, "API listening");
});

server.on("error", (error) => {
  logger.fatal({ err: error }, "API failed to listen");
  process.exit(1);
});

let shuttingDown = false;

function shutdown(signal: string): void {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info({ signal }, "Shutting down API");

  const deadline = setTimeout(() => {
    logger.fatal("Shutdown deadline exceeded");
    process.exit(1);
  }, 10_000);

  deadline.unref();

  server.close((error) => {
    clearTimeout(deadline);

    if (error) {
      logger.error({ err: error }, "HTTP server shutdown failed");
      process.exitCode = 1;
      return;
    }

    logger.info("HTTP server closed");
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
