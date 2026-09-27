import { prisma } from "../lib/prisma.js";

export async function isDatabaseReachable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database health check failed", error);
    return false;
  }
}
