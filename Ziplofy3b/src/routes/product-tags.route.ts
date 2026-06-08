import { Router } from "express";
import { createProductTag, deleteProductTag, getProductTagsByStoreId } from "../controllers/product-tags.controller";
import { protect } from "../middlewares/auth.middleware";

export const productTagsRouter = Router();

// Apply authentication middleware to all routes
productTagsRouter.use(protect);

// GET /api/product-tags/store/:storeId - Get product tags by store ID
productTagsRouter.get("/store/:storeId", getProductTagsByStoreId);

// POST /api/product-tags - Create a new product tag
productTagsRouter.post("/", createProductTag);

// DELETE /api/product-tags/:id - Delete a product tag by ID
productTagsRouter.delete("/:id", deleteProductTag);


