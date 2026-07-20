import { Router } from "express";
import { createRequirementsForm, getRequirementsForm, updateRequirementsForm, updateRequirementsFormStatus } from "../controllers/requirements-form.controller";

export const requirementFormRouter = Router();

requirementFormRouter.post("/", createRequirementsForm);
requirementFormRouter.patch("/:id/requirements", updateRequirementsForm);
requirementFormRouter.patch("/:id/status", updateRequirementsFormStatus);
requirementFormRouter.get("/:id", getRequirementsForm);