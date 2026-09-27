export type BackgroundRequest = { type: "OPEN_WORKSPACE"; messageId: string };

export type BackgroundResponse = { ok: true } | { ok: false; error: string };

export async function sendToBackground(request: BackgroundRequest): Promise<void> {
  const response = (await chrome.runtime.sendMessage(request)) as BackgroundResponse | undefined;
  if (!response) {
    throw new Error("Background worker did not respond");
  }
  if (!response.ok) {
    throw new Error(response.error);
  }
}
