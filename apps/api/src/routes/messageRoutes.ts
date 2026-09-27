import { Router } from "express";
import { getMessageById, patchMessage, postMessage } from "../controllers/messageController.js";

export const messageRoutes = Router();

messageRoutes.post("/", postMessage);
messageRoutes.get("/:messageId", getMessageById);
messageRoutes.patch("/:messageId", patchMessage);
