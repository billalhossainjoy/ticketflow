import express from "express";
import { healthRouter } from "./platform/health/health.routes.js";
import { httpLogger } from "./platform/logging/http-logger.js";

export const app = express();

app.disable("x-powered-by");

app.use(httpLogger);
app.use(express.json({ limit: "100kb" }));

app.use("/health", healthRouter);
