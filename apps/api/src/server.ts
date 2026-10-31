import { app } from "./app.js";
import { env } from "./platform/config/env.js";

const server = app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`TicketFlow API listening on port ${env.PORT}`);
});

server.on("error", (error) => {
  console.error("API failed to listen:", error.message);
  process.exit(1);
});

let shuttingDown = false;

function shutdown(signal: string): void {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`Received ${signal}; shutting down`);

  const deadline = setTimeout(() => {
    console.error("Shutdown deadline exceeded");
    process.exit(1);
  }, 10_000);

  deadline.unref();

  server.close((error) => {
    clearTimeout(deadline);

    if (error) {
      console.error("Shutdown failed:", error.message);
      process.exitCode = 1;
      return;
    }

    console.log("HTTP server closed");
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
