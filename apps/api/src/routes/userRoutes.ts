import { Router } from "express";
import { getCheckUsername, getUserDevices, postUser } from "../controllers/userController.js";

export const userRoutes = Router();

userRoutes.post("/", postUser);
userRoutes.get("/check-username", getCheckUsername);
userRoutes.get("/:userId/devices", getUserDevices);
