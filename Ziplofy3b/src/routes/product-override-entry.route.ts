import { Router } from "express";
import {
  createProductOverrideEntry,
  getProductOverrideEntriesByProductOverrideId,
  deleteProductOverrideEntry,
} from "../controllers/product-override-entry.controller";
import { protect } from "../middlewares/auth.middleware";

export const productOverrideEntryRouter = Router();

// Protected routes (authentication required)
productOverrideEntryRouter.use(protect);

// Get product override entries by product override ID (must come before other routes)
productOverrideEntryRouter.get("/product-override/:productOverrideId", getProductOverrideEntriesByProductOverrideId);

// Create a new product override entry
productOverrideEntryRouter.post("/", createProductOverrideEntry);

// Delete a product override entry
productOverrideEntryRouter.delete("/:id", deleteProductOverrideEntry);

