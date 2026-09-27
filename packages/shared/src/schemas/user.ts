import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(32)
  .regex(/^[a-z0-9_-]+$/, "Only letters, numbers, '_' and '-' are allowed");

export const createUserSchema = z.object({
  username: usernameSchema,
});

export const checkUsernameQuerySchema = z.object({
  username: usernameSchema,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
