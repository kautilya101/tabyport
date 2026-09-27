import { z } from "zod";
import { HttpError } from "./httpError.js";

export function validate<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw HttpError.badRequest("Validation failed", z.flattenError(result.error));
  }
  return result.data;
}
