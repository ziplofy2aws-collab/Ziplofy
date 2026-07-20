import { Router } from "express";
import {
  createPurchaseOrder,
  getPurchaseOrdersByStoreId,
  markPurchaseOrderAsOrdered,
  receivePurchaseOrderInventory,
} from "../controllers/purchase-order.controller";
import { protect } from "../middlewares/auth.middleware";

export const purchaseOrderRouter = Router();

// Protected routes (authentication required)
purchaseOrderRouter.use(protect);

// Create a new purchase order
purchaseOrderRouter.post("/", createPurchaseOrder);

// Get all purchase orders by store ID
purchaseOrderRouter.get("/store/:storeId", getPurchaseOrdersByStoreId);

// Mark as ordered
purchaseOrderRouter.patch('/:id/mark-ordered', markPurchaseOrderAsOrdered);

// Receive inventory
purchaseOrderRouter.post('/:id/receive', receivePurchaseOrderInventory);

