import { Router } from "express";
import { getContactFormSubmissionsByStoreId } from "../controllers/contact-form-submission.controller";
import { protect } from "../middlewares/auth.middleware";

export const contactFormSubmissionRouter = Router();

contactFormSubmissionRouter.use(protect);

contactFormSubmissionRouter.get("/store/:storeId", getContactFormSubmissionsByStoreId);
