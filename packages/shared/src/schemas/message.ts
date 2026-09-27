import { z } from "zod";
import { deviceIdSchema } from "./device.js";

export const MESSAGE_STATUSES = ["PENDING", "DELIVERED", "COMPLETED", "DISMISSED"] as const;

export const messageStatusSchema = z.enum(MESSAGE_STATUSES);

export const messageTypeSchema = z.enum(["OPEN_WORKSPACE"]);

export const MAX_TABS_PER_WORKSPACE = 100;

export const workspaceTabSchema = z.object({
  url: z.url({ protocol: /^https?$/ }),
  title: z.string().max(500),
});

export const workspaceSchema = z.object({
  name: z.string().trim().min(1).max(100),
  tabs: z.array(workspaceTabSchema).min(1).max(MAX_TABS_PER_WORKSPACE),
});

export const sendMessageSchema = z.object({
  senderDeviceId: deviceIdSchema,
  receiverDeviceId: deviceIdSchema,
  type: messageTypeSchema,
  payload: workspaceSchema,
});

export const updateMessageSchema = z.object({
  status: messageStatusSchema.exclude(["PENDING"]),
});

export const listMessagesQuerySchema = z.object({
  status: z
    .string()
    .optional()
    .transform((value) => (value ? value.split(",") : undefined))
    .pipe(z.array(messageStatusSchema).min(1).optional()),
});

export type MessageStatus = z.infer<typeof messageStatusSchema>;
export type MessageType = z.infer<typeof messageTypeSchema>;
export type WorkspaceTab = z.infer<typeof workspaceTabSchema>;
export type Workspace = z.infer<typeof workspaceSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
