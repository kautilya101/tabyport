import type { Request, Response } from "express";
import type { HealthResponse } from "@tabyport/shared";
import { isDatabaseReachable } from "../services/healthService.js";

export async function getHealth(_req: Request, res: Response<HealthResponse>) {
  const databaseReachable = await isDatabaseReachable();
  res.status(databaseReachable ? 200 : 503).json({
    status: databaseReachable ? "ok" : "degraded",
    database: databaseReachable ? "ok" : "unreachable",
  });
}
