import { Router } from "express";
import { createCustomerTag, deleteCustomerTag, getCustomerTagsByStoreId } from "../controllers/customer-tags.controller";
import { protect } from "../middlewares/auth.middleware";

export const customerTagsRouter = Router();

// Apply authentication middleware to all routes
customerTagsRouter.use(protect);

// GET /api/customer-tags/store/:storeId - Get customer tags by store ID
customerTagsRouter.get("/store/:storeId", getCustomerTagsByStoreId);

// POST /api/customer-tags - Create a new customer tag
customerTagsRouter.post("/", createCustomerTag);

// DELETE /api/customer-tags/:id - Delete a customer tag by ID
customerTagsRouter.delete("/:id", deleteCustomerTag);
