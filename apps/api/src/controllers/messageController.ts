import type { Request, Response } from "express";
import { z } from "zod";
import { sendMessageSchema, updateMessageSchema } from "@tabyport/shared";
import { validate } from "../lib/validate.js";
import { getMessage, sendMessage, updateMessageStatus } from "../services/messageService.js";

const messageParamsSchema = z.object({ messageId: z.uuid() });

export async function postMessage(req: Request, res: Response) {
  const input = validate(sendMessageSchema, req.body);
  res.status(201).json(await sendMessage(input));
}

export async function getMessageById(req: Request, res: Response) {
  const { messageId } = validate(messageParamsSchema, req.params);
  res.json(await getMessage(messageId));
}

export async function patchMessage(req: Request, res: Response) {
  const { messageId } = validate(messageParamsSchema, req.params);
  const input = validate(updateMessageSchema, req.body);
  res.json(await updateMessageStatus(messageId, input));
}
