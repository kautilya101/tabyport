import { BACKGROUND_SYNC_PERIOD_MINUTES, SYNC_ALARM_NAME } from "../config";
import { syncPresence } from "../services/deviceService";
import { openWorkspace, syncInbox } from "../services/inboxService";
import type { BackgroundRequest, BackgroundResponse } from "../services/messaging";
import { isWorkspaceNotification } from "../services/notificationService";

async function ensureSyncAlarm(): Promise<void> {
  const alarm = await chrome.alarms.get(SYNC_ALARM_NAME);
  if (!alarm) {
    await chrome.alarms.create(SYNC_ALARM_NAME, {
      periodInMinutes: BACKGROUND_SYNC_PERIOD_MINUTES,
      delayInMinutes: BACKGROUND_SYNC_PERIOD_MINUTES,
    });
  }
}

async function runSync(): Promise<void> {
  try {
    await syncPresence();
    await syncInbox({ notify: true });
  } catch (error) {
    console.warn("Background sync failed", error);
  }
}

async function handleNotificationClick(notificationId: string): Promise<void> {
  if (!isWorkspaceNotification(notificationId)) {
    return;
  }
  await chrome.notifications.clear(notificationId);
  try {
    await chrome.action.openPopup();
  } catch (error) {
    console.warn("Could not open the popup from a notification", error);
  }
}

async function start(): Promise<void> {
  await ensureSyncAlarm();
  await runSync();
}

async function handleRequest(request: BackgroundRequest): Promise<BackgroundResponse> {
  try {
    switch (request.type) {
      case "OPEN_WORKSPACE":
        await openWorkspace(request.messageId);
        return { ok: true };
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

chrome.runtime.onInstalled.addListener(() => void start());
chrome.runtime.onStartup.addListener(() => void start());

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === SYNC_ALARM_NAME) {
    void runSync();
  }
});

chrome.notifications.onClicked.addListener((notificationId) => {
  void handleNotificationClick(notificationId);
});

chrome.runtime.onMessage.addListener((request: BackgroundRequest, _sender, sendResponse) => {
  void handleRequest(request).then(sendResponse);
  return true;
});

void ensureSyncAlarm().catch((error) => {
  console.error("Could not ensure sync alarm", error);
})
