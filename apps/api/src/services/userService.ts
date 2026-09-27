import type { CheckUsernameResponse, CreateUserResponse, UserDto } from "@tabyport/shared";
import { Prisma, type User } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt.toISOString(),
  };
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createOrGetUser(username: string): Promise<CreateUserResponse> {
  try {
    const user = await prisma.user.create({ data: { username } });
    return { user: toUserDto(user), created: true };
  } catch (error) {
    if (!isUniqueViolation(error)) {
      throw error;
    }
    const user = await prisma.user.findUniqueOrThrow({ where: { username } });
    return { user: toUserDto(user), created: false };
  }
}

export async function checkUsername(username: string): Promise<CheckUsernameResponse> {
  const existing = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  return { username, available: existing === null };
}
