import { Router } from "express";
import { getCountryTaxByCountryId } from "../controllers/country-tax.controller";
import { protect } from "../middlewares/auth.middleware";

export const countryTaxRouter = Router();

// Protected routes (authentication required)
countryTaxRouter.use(protect);

// Get country tax by country ID
countryTaxRouter.get("/:countryId", getCountryTaxByCountryId);

