import { Request, Response } from "express";
import { PurchaseOrderEntry } from "../models/purchase-order-entry/purchase-order-entry.model";
import { InventoryLevelModel } from "../models/inventory-level/inventory-level.model";
import { ICreatePurchaseOrder, IPurchaseOrderFilters, PurchaseOrder } from "../models/purchase-order/purchase-order.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import mongoose from "mongoose";
import { Vendor } from "../models/vendor/vendor.model";

// Interface for creating purchase order with entries
interface ICreatePurchaseOrderWithEntries extends ICreatePurchaseOrder {
  entries: Array<{
    variantId: string;
    supplierSku?: string;
    quantityOrdered: number;
    cost: number;
    taxPercent?: number;
  }>;
}

// Create a new purchase order
export const createPurchaseOrder = asyncErrorHandler(async (req: Request, res: Response) => {
  const {storeId, supplierId, destinationLocationId, orderDate, tags, paymentTerm, supplierCurrency, shippingCarrier, trackingNumber, expectedArrivalDate, costAdjustments, status, entries} = req.body as ICreatePurchaseOrderWithEntries;
  const userId = req.user?.id;

  if (!userId) {
    throw new CustomError("User not authenticated", 401);
  }

  // Validate required fields
  if (!storeId || !supplierId || !destinationLocationId) {
    throw new CustomError("Store ID, Supplier ID, and Destination Location ID are required", 400);
  }

  // Validate entries
  if (!entries || entries.length === 0) {
    throw new CustomError("At least one entry is required", 400);
  }

  // Validate each entry
  for (const entry of entries) {
    if (!entry.variantId || !entry.quantityOrdered || !entry.cost) {
      throw new CustomError("Each entry must have variantId, quantityOrdered, and cost", 400);
    }
  }

  // Create the purchase order
  const purchaseOrder = await PurchaseOrder.create({
    storeId,
    supplierId,
    destinationLocationId,
    orderDate: orderDate || new Date(),
    tags: tags || [],
    paymentTerm,
    supplierCurrency,
    shippingCarrier,
    trackingNumber,
    expectedArrivalDate,
    costAdjustments: costAdjustments || [],
    status: status || 'draft',
    isDeleted: false,
  });

  // Create purchase order entries
  const createdEntries = [];
  for (const entry of entries) {
    const totalCost = entry.quantityOrdered * entry.cost;
    const taxAmount = entry.taxPercent ? (totalCost * entry.taxPercent) / 100 : 0;
    const finalTotalCost = totalCost + taxAmount;

    const purchaseOrderEntry = await PurchaseOrderEntry.create({
      purchaseOrderId: purchaseOrder._id,
      variantId: entry.variantId,
      supplierSku: entry.supplierSku,
      quantityOrdered: entry.quantityOrdered,
      quantityReceived: 0, // Default to 0 for new orders
      cost: entry.cost,
      taxPercent: entry.taxPercent || 0,
      totalCost: finalTotalCost,
    });

    createdEntries.push(purchaseOrderEntry);
  }

  // Calculate totals for the purchase order
  const subtotalCost = createdEntries.reduce((sum, entry) => sum + (entry.quantityOrdered * entry.cost), 0);
  const totalTax = createdEntries.reduce((sum, entry) => {
    const lineTotal = entry.quantityOrdered * entry.cost;
    return sum + (lineTotal * (entry.taxPercent || 0) / 100);
  }, 0);
  const totalCost = subtotalCost + totalTax;

  // Update purchase order with calculated totals
  purchaseOrder.subtotalCost = subtotalCost;
  purchaseOrder.totalTax = totalTax;
  purchaseOrder.totalCost = totalCost;
  await purchaseOrder.save();

  // Populate the purchase order with tags and other references
  const populatedPurchaseOrder = await PurchaseOrder.findById(purchaseOrder._id)
    .populate('storeId', 'storeName')
    .populate('supplierId', 'name')
    .populate('destinationLocationId', 'name address')
    .populate('tags', 'name');

  res.status(201).json({
    success: true,
    message: "Purchase order created successfully",
    data: {
      purchaseOrder: populatedPurchaseOrder,
    },
  });
});

// Get all purchase orders by store ID
export const getPurchaseOrdersByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw new CustomError("User not authenticated", 401);
  }

  if (!storeId) {
    throw new CustomError("Store ID is required", 400);
  }

  // Optional query parameters for filtering
  const {
    status,
    isDeleted = false,
    dateFrom,
    dateTo,
  } = req.query;

  // Build MongoDB query
  const query: any = {
    storeId,
    isDeleted: isDeleted === 'true',
  };

  if (status) {
    query.status = status as any;
  }

  if (dateFrom || dateTo) {
    query.orderDate = {};
    if (dateFrom) {
      query.orderDate.$gte = new Date(dateFrom as string);
    }
    if (dateTo) {
      query.orderDate.$lte = new Date(dateTo as string);
    }
  }

  // Get purchase orders
  const purchaseOrders = await PurchaseOrder.find(query)
    .populate('storeId', 'storeName')
    .populate('supplierId', 'name')
    .populate('destinationLocationId', 'name address')
    .populate('tags', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Purchase orders retrieved successfully",
    data: {
      purchaseOrders,
    },
  });
});

// Mark purchase order as ordered
export const markPurchaseOrderAsOrdered = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid purchase order id", 400);
  }
  const po = await PurchaseOrder.findById(id);
  if (!po) throw new CustomError("Purchase order not found", 404);
  if (po.status !== 'draft') {
    throw new CustomError("Only draft purchase orders can be marked as ordered", 400);
  }
  po.status = 'ordered';
  await po.save();

  // Increment destination location incoming for each variant in entries
  const entries = await PurchaseOrderEntry.find({ purchaseOrderId: po._id }).lean();
  for (const entry of entries) {
    const variantId = (entry as any).variantId as mongoose.Types.ObjectId;
    const qty = Math.max(0, Number((entry as any).quantityOrdered) || 0);
    const destinationId = po.destinationLocationId as unknown as mongoose.Types.ObjectId;
    if (!variantId || !destinationId || qty <= 0) continue;

    let level = await InventoryLevelModel.findOne({ variantId, locationId: destinationId });
    if (!level) {
      level = await InventoryLevelModel.create({
        variantId,
        locationId: destinationId,
        onHand: 0,
        committed: 0,
        unavailable: { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 },
        available: 0,
        incoming: 0,
      } as any);
    }
    level.incoming = Math.max(0, (level.incoming || 0) + qty);
    await level.save();
  }
  const populated = await PurchaseOrder.findById(po._id)
    .populate('storeId', 'storeName')
    .populate('supplierId', 'name')
    .populate('destinationLocationId', 'name address')
    .populate('tags', 'name');
  res.status(200).json({ success: true, message: 'Purchase order marked as ordered', data: { purchaseOrder: populated } });
});

// Receive inventory for a purchase order
// Body: { entries: [{ entryId: string, accept: number, reject?: number }] }
export const receivePurchaseOrderInventory = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid purchase order id", 400);
  }

  const po = await PurchaseOrder.findById(id);
  if (!po) throw new CustomError("Purchase order not found", 404);
  if (po.status !== 'ordered' && po.status !== 'partially_received') {
    throw new CustomError("Only ordered purchase orders can receive inventory", 400);
  }

  const payload = (req.body?.entries || []) as Array<{ entryId: string; accept: number; reject?: number }>;
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new CustomError("entries array is required", 400);
  }

  const entries = await PurchaseOrderEntry.find({ purchaseOrderId: id });
  const entryById = new Map(entries.map(e => [String(e._id), e]));

  for (const it of payload) {
    if (!it || !it.entryId || !mongoose.isValidObjectId(it.entryId)) continue;
    const entry = entryById.get(String(it.entryId));
    if (!entry) continue;
    const accept = Math.max(0, Number(it.accept) || 0);
    const reject = Math.max(0, Number(it.reject) || 0);
    const total = Number(entry.quantityOrdered) || 0;
    const alreadyReceived = Number(entry.quantityReceived || 0);
    const remaining = Math.max(0, total - alreadyReceived);
    const processed = Math.min(remaining, accept + reject);
    const effectiveAccept = Math.min(accept, processed);

    // Update entry received
    entry.quantityReceived = Math.min(total, alreadyReceived + effectiveAccept);
    await entry.save();

    // Update inventory levels at destination
    const variantId = entry.variantId as unknown as mongoose.Types.ObjectId;
    const destinationId = po.destinationLocationId as unknown as mongoose.Types.ObjectId;
    if (!variantId || !destinationId) continue;

    let destLevel = await InventoryLevelModel.findOne({ variantId, locationId: destinationId });
    if (!destLevel) {
      destLevel = await InventoryLevelModel.create({
        variantId,
        locationId: destinationId,
        onHand: 0,
        committed: 0,
        unavailable: { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 },
        available: 0,
        incoming: 0,
      } as any);
    }
    const incomingNow = Math.max(0, (destLevel.incoming || 0) - processed);
    const onHandNow = Math.max(0, (destLevel.onHand || 0) + effectiveAccept);
    const availableNow = Math.max(0, (destLevel.available || 0) + effectiveAccept);
    destLevel.incoming = incomingNow;
    destLevel.onHand = onHandNow;
    destLevel.available = availableNow;
    await destLevel.save();
  }

  // Recompute overall status
  const latestEntries = await PurchaseOrderEntry.find({ purchaseOrderId: id });
  const allReceived = latestEntries.every(en => (en.quantityReceived || 0) >= (en.quantityOrdered || 0));
  po.status = allReceived ? 'received' : 'partially_received';
  await po.save();

  res.status(200).json({ success: true, message: 'Inventory updated', data: { status: po.status } });
});

