import { randomUUID } from "node:crypto";
import { logger } from "./logger.js";
import { pinoHttp } from "pino-http";

export const httpLogger = pinoHttp({
  logger,

  genReqId: (_req, res) => {
    const requestId = randomUUID();

    res.setHeader("X-Request-Id", requestId);

    return requestId;
  },

  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        path: req.url?.split("?")[0],
      };
    },

    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },

  customLogLevel: (_req, res, error) => {
    if (error || res.statusCode >= 500) {
      return "error";
    }

    if (res.statusCode >= 400) {
      return "warn";
    }

    return "info";
  },
});
