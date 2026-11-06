import status from "http-status";
import type { ResolvedHttpError } from "../error.types.js";

export function resolveBodyParserError(error: unknown): ResolvedHttpError | null {
  if (typeof error !== "object" || error === null || !("type" in error)) {
    return null;
  }

  switch (error.type) {
    case "entity.parse.failed":
      return {
        statusCode: status.BAD_REQUEST,
        code: "invalid_json",
        title: "Bad Request",
        detail: "Invalid JSON request body.",
      };

    case "entity.too.large":
      return {
        statusCode: status.REQUEST_ENTITY_TOO_LARGE,
        code: "payload_too_large",
        title: "Payload Too Large",
        detail: "Request body exceeds the allowed size.",
      };

    default:
      return null;
  }
}
