import { Request, Response } from "express";
import mongoose from "mongoose";
import { TransferEntry } from "../models/transfer-entry/transfer-entry.model";
import { ITransfer, Transfer } from "../models/transfers/transfers.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { InventoryLevelModel } from "../models/inventory-level/inventory-level.model";
import { ProductVariant } from "../models/product/product-variants.model";

export const createTransfer = asyncErrorHandler(async (req: Request, res: Response) => {
  const {
    storeId,
    originLocationId,
    destinationLocationId,
    referenceName,
    note,
    tags = [],
    transferDate,
    entries,
  } = req.body as Pick<ITransfer, "storeId" | "originLocationId" | "destinationLocationId" | "referenceName" | "note" | "tags" | "transferDate"> & { entries: Array<{ variantId: string; quantity: number }> };

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }
  if (!originLocationId || !mongoose.isValidObjectId(originLocationId)) {
    throw new CustomError("Valid originLocationId is required", 400);
  }
  if (!destinationLocationId || !mongoose.isValidObjectId(destinationLocationId)) {
    throw new CustomError("Valid destinationLocationId is required", 400);
  }
  if (String(originLocationId) === String(destinationLocationId)) {
    throw new CustomError("Origin and destination must be different", 400);
  }
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new CustomError("At least one entry is required", 400);
  }

  // Basic validation for entries
  for (const e of entries) {
    if (!e?.variantId || !mongoose.isValidObjectId(e.variantId)) {
      throw new CustomError("Each entry must include a valid variantId", 400);
    }
    if (typeof e.quantity !== "number" || e.quantity <= 0) {
      throw new CustomError("Each entry must include a positive quantity", 400);
    }
  }

  const tagIds = (tags || []).filter(Boolean).map((t) => new mongoose.Types.ObjectId(t));

  // Create transfer first
  const transfer = await Transfer.create({
    storeId,
    originLocationId,
    destinationLocationId,
    referenceName,
    note,
    tags: tagIds,
    transferDate: transferDate ? new Date(transferDate) : undefined,
  });

  // Create transfer entries
  const entryDocs = entries.map((e) => ({
    transferId: transfer._id,
    variantId: e.variantId,
    quantity: e.quantity,
  }));
  await TransferEntry.insertMany(entryDocs);

  // Populate refs for response
  await transfer.populate([
    { path: "originLocationId" },
    { path: "destinationLocationId" },
    { path: "tags" },
  ]);

  return res.status(201).json({
    success: true,
    data: transfer,
  });
});

export const getTransfersByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }

  const transfers = await Transfer.find({ storeId})
    .sort({ createdAt: -1 })
    .populate([
      { path: "originLocationId" },
      { path: "destinationLocationId" },
      { path: "tags" },
    ]);

  return res.status(200).json({ success: true, data: transfers });
});

export const updateTransfer = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const {
    referenceName,
    note,
    tags,
    transferDate,
    receivedDate,
    status,
  } = req.body as Partial<Pick<ITransfer, "referenceName" | "note" | "tags" | "transferDate" | "receivedDate" | "status">>;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid transferId is required", 400);
  }

  // Check if transfer exists
  const existingTransfer = await Transfer.findById(id);
  if (!existingTransfer) {
    throw new CustomError("Transfer not found", 404);
  }

  // Validate status if provided
  if (status && !["draft", "ready_to_ship", "in_progress", "transferred", "cancelled"].includes(status)) {
    throw new CustomError("Invalid status", 400);
  }

  // Prepare update data - only include fields that are actually provided
  const updateData: Partial<ITransfer> = {};
  
  if (referenceName !== undefined) updateData.referenceName = referenceName;
  if (note !== undefined) updateData.note = note;
  if (tags !== undefined) {
    const tagIds = (tags || []).filter(Boolean).map((t) => new mongoose.Types.ObjectId(t));
    updateData.tags = tagIds;
  }
  if (transferDate !== undefined) updateData.transferDate = transferDate ? new Date(transferDate) : undefined;
  if (receivedDate !== undefined) updateData.receivedDate = receivedDate ? new Date(receivedDate) : undefined;
  if (status !== undefined) updateData.status = status;

  // Update the transfer
  const updatedTransfer = await Transfer.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedTransfer) {
    throw new CustomError("Failed to update transfer", 500);
  }

  // Populate refs for response
  await updatedTransfer.populate([
    { path: "originLocationId" },
    { path: "destinationLocationId" },
    { path: "tags" },
  ]);

  return res.status(200).json({
    success: true,
    data: updatedTransfer,
    message: "Transfer updated successfully"
  });
});

export const deleteTransfer = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid transfer ID is required", 400);
  }

  // Check if transfer exists
  const existingTransfer = await Transfer.findById(id);
  if (!existingTransfer) {
    throw new CustomError("Transfer not found", 404);
  }

  // Business Logic: Only allow hard delete for draft transfers
  if (existingTransfer.status !== "draft") {
    throw new CustomError(
      "Cannot delete transfer. Only draft transfers can be deleted. For non-draft transfers, use the cancel option instead.",
      400
    );
  }

  // Delete all associated transfer entries first
  await TransferEntry.deleteMany({ transferId: id });

  // Hard delete the transfer (permanently remove from database)
  const deletedTransfer = await Transfer.findByIdAndDelete(id);

  if (!deletedTransfer) {
    throw new CustomError("Failed to delete transfer", 500);
  }

  return res.status(200).json({
    success: true,
    message: "Transfer and all associated entries deleted successfully"
  });
});

// POST /transfers/:id/ready-to-ship
export const markTransferReadyToShip = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid transfer ID is required", 400);
  }

  const transfer = await Transfer.findById(id);
  if (!transfer) throw new CustomError("Transfer not found", 404);
  if (transfer.status !== 'draft') {
    throw new CustomError("Only draft transfers can be marked ready to ship", 400);
  }

  // Reserve inventory at origin for each entry quantity
  const originId = transfer.originLocationId as any;
  if (!originId) throw new CustomError("Origin location not set on transfer", 400);

  const entries = await TransferEntry.find({ transferId: transfer._id }).lean();
  for (const entry of entries) {
    const variantId = (entry as any).variantId;
    if (!variantId) continue;

    // Fetch existing level
    const level = await InventoryLevelModel.findOne({ variantId, locationId: originId });
    if (!level) continue;

    const unavail = level.unavailable || { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 } as any;
    const nextUnavailable = {
      ...unavail,
      other: Math.max(0, (unavail.other || 0) + (entry as any).quantity)
    };
    const unavailTotal = (nextUnavailable.damaged || 0) + (nextUnavailable.qualityControl || 0) + (nextUnavailable.safetyStock || 0) + (nextUnavailable.other || 0);
    const nextAvailable = Math.max(0, (level.onHand || 0) - (level.committed || 0) - unavailTotal);

    level.unavailable = nextUnavailable;
    level.available = nextAvailable;
    await level.save();
  }

  transfer.status = 'ready_to_ship';
  await transfer.save();

  return res.status(200).json({ success: true, message: 'Transfer marked as ready to ship and inventory reserved at origin' });
});


