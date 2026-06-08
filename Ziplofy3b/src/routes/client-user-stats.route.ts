import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { getClientUserStats } from "../controllers/client-user-stats.controller";

export const clientUserStatsRouter = Router();
clientUserStatsRouter.use(protect);

clientUserStatsRouter.get("/:userId", getClientUserStats);
