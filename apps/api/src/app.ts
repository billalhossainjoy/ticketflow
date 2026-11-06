import express from "express";
import { errorHandler } from "./platform/errors/error-handler.js";
import { notFoundHandler } from "./platform/errors/not-found.handler.js";
import { healthRouter } from "./platform/health/health.routes.js";
import { httpLogger } from "./platform/logging/http-logger.js";
import { identityRouter } from "./modules/identity/identity.routes.js";

export const app = express();

app.disable("x-powered-by");

app.use(httpLogger);

// Better Auth must receive the raw request body.
app.use(identityRouter);

app.use(express.json({ limit: "100kb" }));

app.use("/health", healthRouter);

app.use(notFoundHandler);
app.use(errorHandler);
