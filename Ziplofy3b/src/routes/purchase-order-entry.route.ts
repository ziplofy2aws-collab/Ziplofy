import { Router } from "express";
import { getEntriesByPurchaseOrderId } from "../controllers/purchase-order-entry.controller";
import { protect } from "../middlewares/auth.middleware";

export const purchaseOrderEntryRouter = Router();

purchaseOrderEntryRouter.use(protect);

// GET /api/purchase-order-entries/purchase-order/:purchaseOrderId
purchaseOrderEntryRouter.get('/purchase-order/:purchaseOrderId', getEntriesByPurchaseOrderId);


