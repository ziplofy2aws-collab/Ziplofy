import { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import { RoleType } from "../types";
import { createAssignedSupportDeveloper } from "../controllers/assigned-support-developer.controller";

export const assignedSupportDeveloperRouter = Router();

assignedSupportDeveloperRouter.post("/", protect, authorize(RoleType.SUPER_ADMIN), createAssignedSupportDeveloper);
