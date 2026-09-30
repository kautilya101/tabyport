import { prisma } from "../lib/prisma.js";

export const MESSAGE_RETENTION_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export async function deleteExpiredMessages(now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - MESSAGE_RETENTION_DAYS * DAY_MS);
  const { count } = await prisma.message.deleteMany({
    where: {
      OR: [
        { status: "COMPLETED", completedAt: { lt: cutoff } },
        { status: "DISMISSED", dismissedAt: { lt: cutoff } },
      ],
    },
  });
  return count;
}
