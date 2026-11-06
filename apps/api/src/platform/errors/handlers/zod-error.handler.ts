import status from "http-status";
import { ZodError } from "zod";
import type { ResolvedHttpError } from "../error.types.js";

export function resolveZodError(error: unknown): ResolvedHttpError | null {
  if (!(error instanceof ZodError)) {
    return null;
  }

  return {
    statusCode: status.BAD_REQUEST,
    code: "validation_error",
    title: "Bad Request",
    detail: "Request validation failed.",
  };
}
