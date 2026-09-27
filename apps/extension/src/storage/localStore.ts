import type { MessageDto } from "@tabyport/shared";

export interface Session {
  userId: string;
  username: string;
  deviceName: string;
}

interface StoreSchema {
  deviceId: string;
  session: Session;
  inbox: MessageDto[];
  openedMessageIds: string[];
  notifiedMessageIds: string[];
  pendingCompletionIds: string[];
}

type StoreKey = keyof StoreSchema;

export async function readValue<K extends StoreKey>(key: K): Promise<StoreSchema[K] | undefined> {
  const result = await chrome.storage.local.get(key);
  return result[key] as StoreSchema[K] | undefined;
}

export async function writeValue<K extends StoreKey>(key: K, value: StoreSchema[K]): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

export function onValueChanged<K extends StoreKey>(
  key: K,
  listener: (value: StoreSchema[K] | undefined) => void,
): () => void {
  const handler = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
    if (area === "local" && key in changes) {
      listener(changes[key]?.newValue as StoreSchema[K] | undefined);
    }
  };
  chrome.storage.onChanged.addListener(handler);
  return () => chrome.storage.onChanged.removeListener(handler);
}
