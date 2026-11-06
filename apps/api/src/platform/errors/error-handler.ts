import { STATUS_CODES } from "node:http";
import type { ErrorRequestHandler } from "express";
import status from "http-status";

import { logger } from "../logging/logger.js";
import { resolveAppError } from "./handlers/app-error.handler.js";
import { resolveBodyParserError } from "./handlers/body-parser-error.handler.js";
import { resolveZodError } from "./handlers/zod-error.handler.js";

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const resolved =
    resolveAppError(error) ?? resolveBodyParserError(error) ?? resolveZodError(error);

  const response = resolved ?? {
    statusCode: status.INTERNAL_SERVER_ERROR,
    code: "internal_error",
    detail: "An unexpected error occurred.",
  };

  const header = res.getHeader("X-Request-Id");
  const requestId = typeof header === "string" ? header : undefined;

  if (!resolved) {
    logger.error({ err: error, requestId }, "Unhandled API error");
  }

  res
    .status(response.statusCode)
    .type("application/problem+json")
    .json({
      type: "about:blank",
      title: STATUS_CODES[response.statusCode] ?? "Error",
      status: response.statusCode,
      detail: response.detail,
      ...(requestId && {
        instance: `urn:uuid:${requestId}`,
        requestId,
      }),
      code: response.code,
    });
};
