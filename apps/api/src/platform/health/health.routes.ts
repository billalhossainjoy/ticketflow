import { Router } from "express";
import { checkDatabaseReadiness } from "../database/readiness.js";

export const healthRouter = Router();

healthRouter.get("/live", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

healthRouter.get("/ready", async (_req, res) => {
  const isReady = await checkDatabaseReadiness();

  res.status(isReady ? 200 : 503).json({
    status: isReady ? "ready" : "not_ready",
  });
});
