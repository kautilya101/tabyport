import { Router } from "express";
import { getDeviceMessages, getStatus, postDevice, postHeartbeat } from "../controllers/deviceController.js";

export const deviceRoutes = Router();

deviceRoutes.post("/", postDevice);
deviceRoutes.post("/:deviceId/heartbeat", postHeartbeat);
deviceRoutes.get("/:deviceId/status", getStatus);
deviceRoutes.get("/:deviceId/messages", getDeviceMessages);
