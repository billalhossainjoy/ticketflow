import type { RequestHandler } from "express";
import status from "http-status";
import { AppError } from "./app-error.js";

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new AppError(status.NOT_FOUND, "route_not_found", "The requested endpoint does not exist."));
};
