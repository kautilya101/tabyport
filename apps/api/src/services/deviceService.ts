import {
  ONLINE_THRESHOLD_MS,
  type DeviceDto,
  type DeviceStatusDto,
  type RegisterDeviceInput,
} from "@tabyport/shared";
import type { Device } from "../generated/prisma/client.js";
import { HttpError } from "../lib/httpError.js";
import { prisma } from "../lib/prisma.js";

function isOnline(lastSeenAt: Date, now = new Date()): boolean {
  return now.getTime() - lastSeenAt.getTime() <= ONLINE_THRESHOLD_MS;
}

function toDeviceDto(device: Device): DeviceDto {
  return {
    id: device.id,
    deviceId: device.deviceId,
    userId: device.userId,
    name: device.name,
    createdAt: device.createdAt.toISOString(),
    lastSeenAt: device.lastSeenAt.toISOString(),
    online: isOnline(device.lastSeenAt),
  };
}

function toDeviceStatusDto(device: Device): DeviceStatusDto {
  return {
    deviceId: device.deviceId,
    online: isOnline(device.lastSeenAt),
    lastSeenAt: device.lastSeenAt.toISOString(),
  };
}

async function assertUserExists(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) {
    throw HttpError.notFound(`User ${userId} not found`);
  }
}

export async function findDeviceOrThrow(deviceId: string): Promise<Device> {
  const device = await prisma.device.findUnique({ where: { deviceId } });
  if (!device) {
    throw HttpError.notFound(`Device ${deviceId} not found`);
  }
  return device;
}

export async function registerDevice(input: RegisterDeviceInput): Promise<DeviceDto> {
  await assertUserExists(input.userId);
  const now = new Date();
  const device = await prisma.device.upsert({
    where: { deviceId: input.deviceId },
    create: { ...input, lastSeenAt: now },
    update: { userId: input.userId, name: input.name, lastSeenAt: now },
  });
  return toDeviceDto(device);
}

export async function listUserDevices(userId: string): Promise<DeviceDto[]> {
  await assertUserExists(userId);
  const devices = await prisma.device.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return devices.map((device) => toDeviceDto(device));
}

export async function recordHeartbeat(deviceId: string): Promise<DeviceStatusDto> {
  await findDeviceOrThrow(deviceId);
  const device = await prisma.device.update({
    where: { deviceId },
    data: { lastSeenAt: new Date() },
  });
  return toDeviceStatusDto(device);
}

export async function getDeviceStatus(deviceId: string): Promise<DeviceStatusDto> {
  return toDeviceStatusDto(await findDeviceOrThrow(deviceId));
}
