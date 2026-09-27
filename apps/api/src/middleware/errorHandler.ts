import type { ErrorRequestHandler, RequestHandler } from "express";
import type { ApiErrorResponse } from "@tabyport/shared";
import { Prisma } from "../generated/prisma/client.js";
import { HttpError } from "../lib/httpError.js";

function toHttpError(error: unknown): HttpError {
  if (error instanceof HttpError) {
    return error;
  }
  if (error instanceof SyntaxError && "body" in error) {
    return HttpError.badRequest("Malformed JSON body");
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return HttpError.conflict("Resource already exists");
    }
    if (error.code === "P2025") {
      return HttpError.notFound("Resource not found");
    }
  }
  return new HttpError(500, "INTERNAL_ERROR", "Something went wrong");
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(HttpError.notFound(`Route ${req.method} ${req.path} not found`));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const httpError = toHttpError(error);
  if (httpError.status >= 500) {
    console.error(error);
  }
  const body: ApiErrorResponse = {
    error: {
      code: httpError.code,
      message: httpError.message,
      details: httpError.details,
    },
  };
  res.status(httpError.status).json(body);
};
