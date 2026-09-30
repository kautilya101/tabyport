import { createApp } from "./app.js";
import { config } from "./config.js";
import { startMessageCleanupJob } from "./jobs/messageCleanupJob.js";
import { prisma } from "./lib/prisma.js";

const server = createApp().listen(config.PORT, () => {
  console.log(`API listening on http://localhost:${config.PORT}`);
});

const stopMessageCleanupJob = startMessageCleanupJob();

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down`);
  stopMessageCleanupJob();
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
