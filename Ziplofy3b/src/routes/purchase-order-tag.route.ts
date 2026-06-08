import { Router } from "express";
import {
    createPurchaseOrderTag,
    deletePurchaseOrderTag,
    getPurchaseOrderTagsByStoreId,
} from "../controllers/purchase-order-tag.controller";
import { protect } from "../middlewares/auth.middleware";

export const purchaseOrderTagRouter = Router();

// Protected routes (authentication required)
purchaseOrderTagRouter.use(protect);

// Create a new purchase order tag
purchaseOrderTagRouter.post("/", createPurchaseOrderTag);

// Get all purchase order tags by store ID
purchaseOrderTagRouter.get("/store/:storeId", getPurchaseOrderTagsByStoreId);

// Delete a purchase order tag by ID
purchaseOrderTagRouter.delete("/:id", deletePurchaseOrderTag);
