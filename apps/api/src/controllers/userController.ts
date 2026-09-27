import type { Request, Response } from "express";
import { z } from "zod";
import { checkUsernameQuerySchema, createUserSchema } from "@tabyport/shared";
import { validate } from "../lib/validate.js";
import { checkUsername, createOrGetUser } from "../services/userService.js";
import { listUserDevices } from "../services/deviceService.js";

const userParamsSchema = z.object({ userId: z.uuid() });

export async function postUser(req: Request, res: Response) {
  const { username } = validate(createUserSchema, req.body);
  const result = await createOrGetUser(username);
  res.status(result.created ? 201 : 200).json(result);
}

export async function getCheckUsername(req: Request, res: Response) {
  const { username } = validate(checkUsernameQuerySchema, req.query);
  res.json(await checkUsername(username));
}

export async function getUserDevices(req: Request, res: Response) {
  const { userId } = validate(userParamsSchema, req.params);
  res.json(await listUserDevices(userId));
}
