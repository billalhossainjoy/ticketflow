import express from "express";
import { healthRouter } from "./platform/health/health.routes.js";

export const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

app.use("/health", healthRouter);
