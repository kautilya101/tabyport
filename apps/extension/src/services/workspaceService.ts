import { MAX_TABS_PER_WORKSPACE, type Workspace, type WorkspaceTab } from "@tabyport/shared";
import { api } from "./apiClient";
import { getOrCreateDeviceId } from "./deviceService";

export interface CapturedWindow {
  tabs: WorkspaceTab[];
  suggestedName: string;
  skippedCount: number;
}

function isTransferableUrl(url: string | undefined): url is string {
  return url !== undefined && /^https?:\/\//.test(url);
}

function fallbackName(): string {
  return `Workspace ${new Date().toLocaleString()}`;
}

export async function captureCurrentWindow(): Promise<CapturedWindow> {
  const chromeTabs = await chrome.tabs.query({ currentWindow: true });
  const transferable = chromeTabs.filter((tab) => isTransferableUrl(tab.url));

  const tabs = transferable.slice(0, MAX_TABS_PER_WORKSPACE).map((tab) => ({
    url: tab.url as string,
    title: tab.title ?? "",
  }));

  const activeTitle = transferable.find((tab) => tab.active)?.title?.trim();

  return {
    tabs,
    suggestedName: activeTitle ? activeTitle.slice(0, 100) : fallbackName(),
    skippedCount: chromeTabs.length - tabs.length,
  };
}

export async function sendWorkspace(receiverDeviceId: string, workspace: Workspace) {
  const senderDeviceId = await getOrCreateDeviceId();
  return api.sendMessage({
    senderDeviceId,
    receiverDeviceId,
    type: "OPEN_WORKSPACE",
    payload: workspace,
  });
}
