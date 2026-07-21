import { Router } from "express";
import { createSupportDeveloper, getSupportDevelopers } from "../controllers/support-developer.controller";

export const supportDeveloperRouter = Router();


supportDeveloperRouter.post("/", createSupportDeveloper);
supportDeveloperRouter.get("/", getSupportDevelopers);
