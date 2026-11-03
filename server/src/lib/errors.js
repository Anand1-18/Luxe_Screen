import { Prisma } from "@prisma/client";
import { z } from "zod";

/** An expected error with an HTTP status and a machine-readable code, e.g. 409 SLOT_UNAVAILABLE. */
export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function sendError(res, status, code, message, details) {
  res
    .status(status)
    .json({ error: { code, message, ...(details === undefined ? {} : { details }) } });
}

/** 404 for unknown /api routes. */
export function notFoundHandler(req, res) {
  sendError(res, 404, "NOT_FOUND", `No route for ${req.method} ${req.originalUrl}`);
}

/**
 * Last middleware in the chain: turns every thrown error into the uniform
 * `{ error: { code, message, details? } }` response.
 */
// Express recognises error handlers by their four arguments, so `next` must stay.
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  if (error instanceof ApiError) {
    return sendError(res, error.status, error.code, error.message, error.details);
  }
  if (error instanceof z.ZodError) {
    return sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "Some fields are invalid.",
      z.flattenError(error),
    );
  }
  // express.json() reports malformed bodies as a SyntaxError with status 400.
  if (error?.type === "entity.parse.failed") {
    return sendError(res, 400, "INVALID_JSON", "Request body must be valid JSON.");
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return sendError(res, 404, "NOT_FOUND", "The requested record was not found.");
  }
  console.error("[api] Unhandled error", error);
  sendError(res, 500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
}
