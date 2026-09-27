import type {
  ApiErrorResponse,
  CheckUsernameResponse,
  CreateUserResponse,
  DeviceDto,
  DeviceStatusDto,
  MessageDto,
  MessageStatus,
  RegisterDeviceInput,
  SendMessageInput,
  UpdateMessageInput,
} from "@tabyport/shared";
import { API_URL } from "../config";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new ApiError(
      response.status,
      body?.error.code ?? "UNKNOWN",
      body?.error.message ?? `Request failed with status ${response.status}`,
    );
  }

  return (await response.json()) as T;
}

function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) });
}

function patch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}

export const api = {
  createUser: (username: string) => post<CreateUserResponse>("/users", { username }),

  checkUsername: (username: string) =>
    request<CheckUsernameResponse>(
      `/users/check-username?username=${encodeURIComponent(username)}`,
    ),

  registerDevice: (input: RegisterDeviceInput) => post<DeviceDto>("/devices", input),

  heartbeat: (deviceId: string) =>
    post<DeviceStatusDto>(`/devices/${encodeURIComponent(deviceId)}/heartbeat`),

  listDevices: (userId: string) =>
    request<DeviceDto[]>(`/users/${encodeURIComponent(userId)}/devices`),

  sendMessage: (input: SendMessageInput) => post<MessageDto>("/messages", input),

  listMessages: (deviceId: string, statuses: MessageStatus[]) =>
    request<MessageDto[]>(
      `/devices/${encodeURIComponent(deviceId)}/messages?status=${statuses.join(",")}`,
    ),

  getMessage: (messageId: string) =>
    request<MessageDto>(`/messages/${encodeURIComponent(messageId)}`),

  updateMessage: (messageId: string, input: UpdateMessageInput) =>
    patch<MessageDto>(`/messages/${encodeURIComponent(messageId)}`, input),
};
