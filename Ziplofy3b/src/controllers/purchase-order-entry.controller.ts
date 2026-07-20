import { Request, Response } from "express";
import mongoose from "mongoose";
import { PurchaseOrderEntry } from "../models/purchase-order-entry/purchase-order-entry.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

// GET /api/purchase-order-entries/purchase-order/:purchaseOrderId
export const getEntriesByPurchaseOrderId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { purchaseOrderId } = req.params;

  if (!purchaseOrderId) {
    throw new CustomError("purchaseOrderId is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(purchaseOrderId)) {
    throw new CustomError("Invalid purchaseOrderId format", 400);
  }

  const entries = await PurchaseOrderEntry.find({ purchaseOrderId })
    .populate({
      path: 'variantId',
      select: 'sku optionValues productId',
      populate: { path: 'productId', select: 'title' }
    })
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    data: entries,
    count: entries.length,
  });
});


