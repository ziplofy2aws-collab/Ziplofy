import { Router } from "express";
import { getLoginLogs, getLoginStats, getRecentLogins } from "../controllers/login-log.controller";
import { protect } from "../middlewares/auth.middleware";

export const loginLogRouter = Router();

// All routes require authentication
loginLogRouter.use(protect);

// Get login logs with pagination and filters
loginLogRouter.get("/", getLoginLogs);

// Get login statistics
loginLogRouter.get("/stats", getLoginStats);

// Get recent successful logins
loginLogRouter.get("/recent", getRecentLogins);
