import { AppError } from "../app-error.js";
import type { ResolvedHttpError } from "../error.types.js";

export function resolveAppError(error: unknown): ResolvedHttpError | null {
  if (!(error instanceof AppError)) {
    return null;
  }

  if (!Number.isInteger(error.statusCode) || error.statusCode < 400 || error.statusCode >= 500) {
    return null;
  }

  return {
    statusCode: error.statusCode,
    code: error.code,
    title: "Request failed",
    detail: error.message,
  };
}
