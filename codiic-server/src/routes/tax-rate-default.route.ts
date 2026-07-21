import { Router } from "express";
import {
  getTaxDefaultsByCountryId,
  getTaxDefaultByCountryAndState,
  getTaxDefaultById,
} from "../controllers/tax-rate-default.controller";
import { protect } from "../middlewares/auth.middleware";

export const taxRateDefaultRouter = Router();

// Protected routes (authentication required)
taxRateDefaultRouter.use(protect);

// Get tax default by country ID and state ID (must come before /country/:countryId to avoid route conflicts)
taxRateDefaultRouter.get("/country/:countryId/state/:stateId", getTaxDefaultByCountryAndState);

// Get tax defaults by country ID (with optional filter: ?stateId=xxx)
taxRateDefaultRouter.get("/country/:countryId", getTaxDefaultsByCountryId);

// Get tax default by ID
taxRateDefaultRouter.get("/:id", getTaxDefaultById);

