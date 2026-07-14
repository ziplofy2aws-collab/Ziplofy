import { Router } from "express";
import { createStorefrontContactFormSubmission } from "../../controllers/contact-form-submission.controller";

export const storeFrontContactFormSubmissionRouter = Router();

storeFrontContactFormSubmissionRouter.post("/", createStorefrontContactFormSubmission);
