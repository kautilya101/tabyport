import type { MessageDto } from "@tabyport/shared";

const NOTIFICATION_PREFIX = "workspace:";

export async function updateBadge(waitingCount: number): Promise<void> {
  await chrome.action.setBadgeText({ text: waitingCount > 0 ? String(waitingCount) : "" });
  await chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
}

export async function notifyWorkspaceWaiting(message: MessageDto): Promise<void> {
  const tabCount = message.payload.tabs.length;
  await chrome.notifications.create(`${NOTIFICATION_PREFIX}${message.id}`, {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icons/icon-128.png"),
    title: "Workspace waiting",
    message: `${message.payload.name}: ${tabCount} ${tabCount === 1 ? "tab" : "tabs"} from ${message.senderDeviceName}`,
  });
}

export async function clearWorkspaceNotification(messageId: string): Promise<void> {
  await chrome.notifications.clear(`${NOTIFICATION_PREFIX}${messageId}`);
}

export function isWorkspaceNotification(notificationId: string): boolean {
  return notificationId.startsWith(NOTIFICATION_PREFIX);
}
