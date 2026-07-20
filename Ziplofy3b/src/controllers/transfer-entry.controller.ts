import { Request, Response } from "express";
import mongoose from "mongoose";
import { TransferEntry } from "../models/transfer-entry/transfer-entry.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { Product } from "../models/product/product.model";
import { Transfer } from "../models/transfers/transfers.model";
import { InventoryLevelModel } from "../models/inventory-level/inventory-level.model";

export const getTransferEntriesByTransferId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid transferId is required", 400);
  }

  const entries = await TransferEntry.find({ transferId: new mongoose.Types.ObjectId(id) })
    .sort({ createdAt: -1 })
    .populate({ 
      path: "variantId", 
      select: "sku optionValues price images productId"
    });

  // Get all unique product IDs from the entries
  const productIds = [...new Set(entries.map(entry => (entry.variantId as any)?.productId).filter(Boolean))];

  console.log('product ids are', productIds);
  
  // Fetch product names separately
  const products = await Product.find({ _id: { $in: productIds } }).select("title");
  
  // Create a map of product ID to product name
  const productMap = products.reduce((map, product) => {
    map[product._id.toString()] = product.title;
    return map;
  }, {} as Record<string, string>);

  // Resolve origin location for this transfer
  const transferDoc = await Transfer.findById(id).select({ originLocationId: 1 });
  const originLocationId = transferDoc?.originLocationId ? new mongoose.Types.ObjectId(String(transferDoc.originLocationId)) : null;

  // Fetch inventory levels at origin for all variants in this transfer
  let atOriginMap = new Map<string, number>();
  if (originLocationId) {
    const variantIds = entries.map(e => e.variantId?._id).filter(Boolean) as mongoose.Types.ObjectId[];
    if (variantIds.length > 0) {
      const levels = await InventoryLevelModel.find({
        variantId: { $in: variantIds },
        locationId: originLocationId,
      }).select({ variantId: 1, available: 1 }).lean();
      atOriginMap = new Map(levels.map(lvl => [String(lvl.variantId), Number(lvl.available) || 0]));
    }
  }

  // Attach product names and atOrigin to entries
  const entriesWithProductNames = entries.map(entry => {
    const entryObj = entry.toObject();
    if (entryObj.variantId && (entryObj.variantId as any).productId) {
      (entryObj.variantId as any).productName = productMap[(entryObj.variantId as any).productId.toString()] || null;
    }
    // Ensure optionValues (Map) is serialized to a plain object
    if (entry.variantId && (entry.variantId as any).optionValues) {
      const raw = (entry.variantId as any).optionValues;
      if (raw instanceof Map) {
        (entryObj.variantId as any).optionValues = Object.fromEntries(raw);
      }
    }
    // add atOrigin from inventory levels (default 0 if not found)
    const vId = entryObj.variantId?._id ? String(entryObj.variantId._id) : null;
    (entryObj as any).atOrigin = vId && atOriginMap.has(vId) ? atOriginMap.get(vId) : 0;
    return entryObj;
  });

  return res.status(200).json({ success: true, data: entriesWithProductNames });
});


