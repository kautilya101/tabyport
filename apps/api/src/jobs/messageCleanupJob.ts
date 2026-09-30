import { deleteExpiredMessages } from "../services/retentionService.js";

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

async function runCleanup(): Promise<void> {
  try {
    const deleted = await deleteExpiredMessages();
    if (deleted > 0) {
      console.log(`Deleted ${deleted} expired messages`);
    }
  } catch (error) {
    console.error("Message cleanup failed", error);
  }
}

export function startMessageCleanupJob(): () => void {
  void runCleanup();
  const timer = setInterval(() => void runCleanup(), CLEANUP_INTERVAL_MS);
  timer.unref();
  return () => clearInterval(timer);
}
