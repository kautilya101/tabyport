import type {
  MessageDto,
  MessageStatus,
  SendMessageInput,
  UpdateMessageInput,
  Workspace,
} from "@tabyport/shared";
import type { Message } from "../generated/prisma/client.js";
import { HttpError } from "../lib/httpError.js";
import { prisma } from "../lib/prisma.js";
import { findDeviceOrThrow } from "./deviceService.js";

type MessageWithSender = Message & { sender: { name: string } };

type TargetStatus = UpdateMessageInput["status"];

const ALLOWED_PREVIOUS_STATUSES: Record<TargetStatus, MessageStatus[]> = {
  DELIVERED: ["PENDING"],
  COMPLETED: ["PENDING", "DELIVERED"],
  DISMISSED: ["PENDING", "DELIVERED"],
};

const TIMESTAMP_FIELD: Record<TargetStatus, "deliveredAt" | "completedAt" | "dismissedAt"> = {
  DELIVERED: "deliveredAt",
  COMPLETED: "completedAt",
  DISMISSED: "dismissedAt",
};

const includeSender = { sender: { select: { name: true } } } as const;

function toMessageDto(message: MessageWithSender): MessageDto {
  return {
    id: message.id,
    senderDeviceId: message.senderDeviceId,
    senderDeviceName: message.sender.name,
    receiverDeviceId: message.receiverDeviceId,
    type: message.type,
    status: message.status,
    payload: message.payload as Workspace,
    createdAt: message.createdAt.toISOString(),
    deliveredAt: message.deliveredAt?.toISOString() ?? null,
    completedAt: message.completedAt?.toISOString() ?? null,
    dismissedAt: message.dismissedAt?.toISOString() ?? null,
  };
}

async function findMessageOrThrow(messageId: string): Promise<MessageWithSender> {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: includeSender,
  });
  if (!message) {
    throw HttpError.notFound(`Message ${messageId} not found`);
  }
  return message;
}

export async function sendMessage(input: SendMessageInput): Promise<MessageDto> {
  if (input.senderDeviceId === input.receiverDeviceId) {
    throw HttpError.badRequest("A device cannot send a workspace to itself");
  }

  const [sender, receiver] = await Promise.all([
    findDeviceOrThrow(input.senderDeviceId),
    findDeviceOrThrow(input.receiverDeviceId),
  ]);
  if (sender.userId !== receiver.userId) {
    throw HttpError.badRequest("Sender and receiver must belong to the same user");
  }

  const message = await prisma.message.create({
    data: input,
    include: includeSender,
  });
  return toMessageDto(message);
}

export async function listDeviceMessages(
  deviceId: string,
  statuses: MessageStatus[] | undefined,
): Promise<MessageDto[]> {
  await findDeviceOrThrow(deviceId);
  const messages = await prisma.message.findMany({
    where: {
      receiverDeviceId: deviceId,
      ...(statuses && { status: { in: statuses } }),
    },
    orderBy: { createdAt: "desc" },
    include: includeSender,
  });
  return messages.map((message) => toMessageDto(message));
}

export async function getMessage(messageId: string): Promise<MessageDto> {
  return toMessageDto(await findMessageOrThrow(messageId));
}

export async function updateMessageStatus(
  messageId: string,
  { status }: UpdateMessageInput,
): Promise<MessageDto> {
  const { count } = await prisma.message.updateMany({
    where: { id: messageId, status: { in: ALLOWED_PREVIOUS_STATUSES[status] } },
    data: { status, [TIMESTAMP_FIELD[status]]: new Date() },
  });

  const message = await findMessageOrThrow(messageId);
  if (count === 0 && message.status !== status) {
    throw HttpError.conflict(`Cannot change message status from ${message.status} to ${status}`);
  }
  return toMessageDto(message);
}
