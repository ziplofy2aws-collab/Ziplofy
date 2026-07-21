import { Router } from "express";
import { getSuperAdminNotifications } from "../controllers/super-admin.controller";
export const superAdminRouter = Router();

superAdminRouter.get("/notifications", getSuperAdminNotifications);
