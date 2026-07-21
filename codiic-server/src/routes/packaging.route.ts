import { Router } from "express";
import {
  createPackaging,
  deletePackaging,
  getDefaultPackaging,
  getPackagingById,
  getPackagingByStoreId,
  updatePackaging
} from "../controllers/packaging.controller";
import { protect } from "../middlewares/auth.middleware";

export const packagingRouter = Router();

// Protected routes (authentication required)
packagingRouter.use(protect);

// Create a new packaging
packagingRouter.post("/", createPackaging);

// Get all packaging for a specific store
packagingRouter.get("/store/:storeId", getPackagingByStoreId);

// Get default packaging for a store
packagingRouter.get("/store/:storeId/default", getDefaultPackaging);

// Get a specific packaging by ID
packagingRouter.get("/:id", getPackagingById);

// Update a packaging
packagingRouter.put("/:id", updatePackaging);

// Delete a packaging
packagingRouter.delete("/:id", deletePackaging);
