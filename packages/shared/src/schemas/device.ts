import { z } from "zod";

export const deviceIdSchema = z.string().trim().min(1).max(64);

export const deviceNameSchema = z.string().trim().min(1).max(50);

export const registerDeviceSchema = z.object({
  deviceId: deviceIdSchema,
  userId: z.uuid(),
  name: deviceNameSchema,
});

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
