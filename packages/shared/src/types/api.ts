import type { MessageStatus, MessageType, Workspace } from "../schemas/message.js";

export interface UserDto {
  id: string;
  username: string;
  createdAt: string;
}

export interface CreateUserResponse {
  user: UserDto;
  created: boolean;
}

export interface CheckUsernameResponse {
  username: string;
  available: boolean;
}

export interface DeviceDto {
  id: string;
  deviceId: string;
  userId: string;
  name: string;
  createdAt: string;
  lastSeenAt: string;
  online: boolean;
}

export interface DeviceStatusDto {
  deviceId: string;
  online: boolean;
  lastSeenAt: string;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  database: "ok" | "unreachable";
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface MessageDto {
  id: string;
  senderDeviceId: string;
  senderDeviceName: string;
  receiverDeviceId: string;
  type: MessageType;
  status: MessageStatus;
  payload: Workspace;
  createdAt: string;
  deliveredAt: string | null;
  completedAt: string | null;
  dismissedAt: string | null;
}
