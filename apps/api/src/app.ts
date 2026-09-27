import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { deviceRoutes } from "./routes/deviceRoutes.js";
import { healthRoutes } from "./routes/healthRoutes.js";
import { messageRoutes } from "./routes/messageRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));

  app.use("/health", healthRoutes);
  app.use("/users", userRoutes);
  app.use("/devices", deviceRoutes);
  app.use("/messages", messageRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
