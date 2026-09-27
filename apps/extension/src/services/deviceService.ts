import { ApiError, api } from "./apiClient";
import { readValue, writeValue, type Session } from "../storage/localStore";

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await readValue("deviceId");
  if (existing) {
    return existing;
  }
  const deviceId = `device_${crypto.randomUUID()}`;
  await writeValue("deviceId", deviceId);
  return deviceId;
}

export async function onboard(username: string, deviceName: string): Promise<Session> {
  const deviceId = await getOrCreateDeviceId();
  const { user } = await api.createUser(username);
  await api.registerDevice({ deviceId, userId: user.id, name: deviceName });

  const session: Session = { userId: user.id, username: user.username, deviceName };
  await writeValue("session", session);
  return session;
}

export async function syncPresence(): Promise<void> {
  const session = await readValue("session");
  if (!session) {
    return;
  }
  const deviceId = await getOrCreateDeviceId();

  try {
    await api.heartbeat(deviceId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      await api.registerDevice({ deviceId, userId: session.userId, name: session.deviceName });
      return;
    }
    throw error;
  }
}
