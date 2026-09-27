import type { MessageDto } from "@tabyport/shared";
import { api } from "./apiClient";
import { getOrCreateDeviceId } from "./deviceService";
import { clearWorkspaceNotification, notifyWorkspaceWaiting, updateBadge } from "./notificationService";
import { readValue, writeValue } from "../storage/localStore";

const WAITING_STATUSES = ["PENDING", "DELIVERED"] as const;

const openingMessageIds = new Set<string>();

interface SyncOptions {
  notify: boolean;
}

async function readIds(key: "openedMessageIds" | "notifiedMessageIds" | "pendingCompletionIds") {
  return new Set((await readValue(key)) ?? []);
}

async function saveInbox(inbox: MessageDto[]): Promise<void> {
  await writeValue("inbox", inbox);
  await updateBadge(inbox.length);
}

async function removeFromInbox(messageId: string): Promise<void> {
  const inbox = (await readValue("inbox")) ?? [];
  await saveInbox(inbox.filter((message) => message.id !== messageId));
  await clearWorkspaceNotification(messageId);
}

async function acknowledgeDelivery(message: MessageDto): Promise<MessageDto> {
  if (message.status !== "PENDING") {
    return message;
  }
  try {
    return await api.updateMessage(message.id, { status: "DELIVERED" });
  } catch (error) {
    console.warn(`Could not acknowledge message ${message.id}`, error);
    return message;
  }
}

async function flushPendingCompletions(): Promise<void> {
  const pending = await readIds("pendingCompletionIds");
  for (const messageId of pending) {
    try {
      await api.updateMessage(messageId, { status: "COMPLETED" });
      pending.delete(messageId);
    } catch (error) {
      console.warn(`Could not mark message ${messageId} completed`, error);
    }
  }
  await writeValue("pendingCompletionIds", [...pending]);
}

export async function syncInbox({ notify }: SyncOptions): Promise<MessageDto[]> {
  const session = await readValue("session");
  if (!session) {
    return [];
  }
  const deviceId = await getOrCreateDeviceId();

  await flushPendingCompletions();
  const messages = await api.listMessages(deviceId, [...WAITING_STATUSES]);

  const opened = await readIds("openedMessageIds");
  const pendingCompletions = await readIds("pendingCompletionIds");
  const serverIds = new Set(messages.map((message) => message.id));
  const stillRelevantOpened = [...opened].filter(
    (id) => serverIds.has(id) || pendingCompletions.has(id),
  );
  await writeValue("openedMessageIds", stillRelevantOpened);

  const waiting = messages.filter((message) => !opened.has(message.id));
  const inbox = await Promise.all(waiting.map(acknowledgeDelivery));

  const notified = await readIds("notifiedMessageIds");
  const newlyArrived = inbox.filter((message) => !notified.has(message.id));
  await writeValue(
    "notifiedMessageIds",
    inbox.map((message) => message.id),
  );

  await saveInbox(inbox);

  if (notify) {
    await Promise.all(newlyArrived.map(notifyWorkspaceWaiting));
  }
  return inbox;
}

async function markOpenedLocally(messageId: string): Promise<void> {
  const opened = await readIds("openedMessageIds");
  opened.add(messageId);
  await writeValue("openedMessageIds", [...opened]);
}

async function queueCompletion(messageId: string): Promise<void> {
  const pending = await readIds("pendingCompletionIds");
  pending.add(messageId);
  await writeValue("pendingCompletionIds", [...pending]);
}

export async function openWorkspace(messageId: string): Promise<void> {
  if (openingMessageIds.has(messageId)) {
    throw new Error("This workspace is already opening");
  }
  const opened = await readIds("openedMessageIds");
  if (opened.has(messageId)) {
    await removeFromInbox(messageId);
    throw new Error("This workspace was already opened");
  }

  openingMessageIds.add(messageId);
  try {
    const message = await api.getMessage(messageId);
    if (message.status === "COMPLETED" || message.status === "DISMISSED") {
      await removeFromInbox(messageId);
      throw new Error("This workspace was already handled");
    }

    await markOpenedLocally(messageId);
    for (const tab of message.payload.tabs) {
      await chrome.tabs.create({ url: tab.url });
    }

    try {
      await api.updateMessage(messageId, { status: "COMPLETED" });
    } catch (error) {
      console.warn(`Queued completion for message ${messageId}`, error);
      await queueCompletion(messageId);
    }
    await removeFromInbox(messageId);
  } finally {
    openingMessageIds.delete(messageId);
  }
}

export async function dismissWorkspace(messageId: string): Promise<void> {
  await api.updateMessage(messageId, { status: "DISMISSED" });
  await removeFromInbox(messageId);
}
