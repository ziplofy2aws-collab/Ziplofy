import { Router } from "express";
import {
  createProductOverride,
  getProductOverridesByStoreAndCountry,
  getProductOverrideById,
  updateProductOverride,
  deleteProductOverride,
} from "../controllers/product-override.controller";
import { protect } from "../middlewares/auth.middleware";

export const productOverrideRouter = Router();

// Protected routes (authentication required)
productOverrideRouter.use(protect);

// Get product overrides by store ID and country ID (must come before other routes)
productOverrideRouter.get("/store/:storeId/country/:countryId", getProductOverridesByStoreAndCountry);

// Get product override by ID
productOverrideRouter.get("/:id", getProductOverrideById);

// Create a new product override
productOverrideRouter.post("/", createProductOverride);

// Update a product override
productOverrideRouter.put("/:id", updateProductOverride);

// Delete a product override
productOverrideRouter.delete("/:id", deleteProductOverride);

