import { app } from "./app.js";
import { env } from "./platform/config/env.js";
import { closeDatabaseConnections } from "./platform/database/lifecycle.js";
import { logger } from "./platform/logging/logger.js";

const server = app.listen(env.PORT, "0.0.0.0", () => {
  logger.info({ port: env.PORT }, "API listening");
});

server.on("error", (error) => {
  logger.fatal({ err: error }, "API failed to listen");
  process.exit(1);
});

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info({ signal }, "Shutting down API");

  const deadline = setTimeout(() => {
    logger.fatal("Shutdown deadline exceeded");
    process.exit(1);
  }, 10_000);

  deadline.unref();

  try {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    logger.info("HTTP server closed");
  } catch (error) {
    logger.error({ err: error }, "HTTP server shutdown failed");
    process.exitCode = 1;
  }

  try {
    await closeDatabaseConnections();

    logger.info("Database cleanup completed");
  } catch (error) {
    logger.error({ err: error }, "Database shutdown failed");
    process.exitCode = 1;
  } finally {
    clearTimeout(deadline);
  }
}

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
