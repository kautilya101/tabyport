import type { Request, Response } from "express";
import { z } from "zod";
import { deviceIdSchema, listMessagesQuerySchema, registerDeviceSchema } from "@tabyport/shared";
import { validate } from "../lib/validate.js";
import { getDeviceStatus, recordHeartbeat, registerDevice } from "../services/deviceService.js";
import { listDeviceMessages } from "../services/messageService.js";

const deviceParamsSchema = z.object({ deviceId: deviceIdSchema });

export async function postDevice(req: Request, res: Response) {
  const input = validate(registerDeviceSchema, req.body);
  res.json(await registerDevice(input));
}

export async function postHeartbeat(req: Request, res: Response) {
  const { deviceId } = validate(deviceParamsSchema, req.params);
  res.json(await recordHeartbeat(deviceId));
}

export async function getStatus(req: Request, res: Response) {
  const { deviceId } = validate(deviceParamsSchema, req.params);
  res.json(await getDeviceStatus(deviceId));
}

export async function getDeviceMessages(req: Request, res: Response) {
  const { deviceId } = validate(deviceParamsSchema, req.params);
  const { status } = validate(listMessagesQuerySchema, req.query);
  res.json(await listDeviceMessages(deviceId, status));
}
