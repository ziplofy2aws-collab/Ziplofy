"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markTransferReadyToShip = exports.deleteTransfer = exports.updateTransfer = exports.getTransfersByStoreId = exports.createTransfer = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const transfer_entry_model_1 = require("../models/transfer-entry/transfer-entry.model");
const transfers_model_1 = require("../models/transfers/transfers.model");
const error_utils_1 = require("../utils/error.utils");
const inventory_level_model_1 = require("../models/inventory-level/inventory-level.model");
exports.createTransfer = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, originLocationId, destinationLocationId, referenceName, note, tags = [], transferDate, entries, } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Valid storeId is required", 400);
    }
    if (!originLocationId || !mongoose_1.default.isValidObjectId(originLocationId)) {
        throw new error_utils_1.CustomError("Valid originLocationId is required", 400);
    }
    if (!destinationLocationId || !mongoose_1.default.isValidObjectId(destinationLocationId)) {
        throw new error_utils_1.CustomError("Valid destinationLocationId is required", 400);
    }
    if (String(originLocationId) === String(destinationLocationId)) {
        throw new error_utils_1.CustomError("Origin and destination must be different", 400);
    }
    if (!Array.isArray(entries) || entries.length === 0) {
        throw new error_utils_1.CustomError("At least one entry is required", 400);
    }
    // Basic validation for entries
    for (const e of entries) {
        if (!e?.variantId || !mongoose_1.default.isValidObjectId(e.variantId)) {
            throw new error_utils_1.CustomError("Each entry must include a valid variantId", 400);
        }
        if (typeof e.quantity !== "number" || e.quantity <= 0) {
            throw new error_utils_1.CustomError("Each entry must include a positive quantity", 400);
        }
    }
    const tagIds = (tags || []).filter(Boolean).map((t) => new mongoose_1.default.Types.ObjectId(t));
    // Create transfer first
    const transfer = await transfers_model_1.Transfer.create({
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
    await transfer_entry_model_1.TransferEntry.insertMany(entryDocs);
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
exports.getTransfersByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Valid storeId is required", 400);
    }
    const transfers = await transfers_model_1.Transfer.find({ storeId })
        .sort({ createdAt: -1 })
        .populate([
        { path: "originLocationId" },
        { path: "destinationLocationId" },
        { path: "tags" },
    ]);
    return res.status(200).json({ success: true, data: transfers });
});
exports.updateTransfer = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { referenceName, note, tags, transferDate, receivedDate, status, } = req.body;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid transferId is required", 400);
    }
    // Check if transfer exists
    const existingTransfer = await transfers_model_1.Transfer.findById(id);
    if (!existingTransfer) {
        throw new error_utils_1.CustomError("Transfer not found", 404);
    }
    // Validate status if provided
    if (status && !["draft", "ready_to_ship", "in_progress", "transferred", "cancelled"].includes(status)) {
        throw new error_utils_1.CustomError("Invalid status", 400);
    }
    // Prepare update data - only include fields that are actually provided
    const updateData = {};
    if (referenceName !== undefined)
        updateData.referenceName = referenceName;
    if (note !== undefined)
        updateData.note = note;
    if (tags !== undefined) {
        const tagIds = (tags || []).filter(Boolean).map((t) => new mongoose_1.default.Types.ObjectId(t));
        updateData.tags = tagIds;
    }
    if (transferDate !== undefined)
        updateData.transferDate = transferDate ? new Date(transferDate) : undefined;
    if (receivedDate !== undefined)
        updateData.receivedDate = receivedDate ? new Date(receivedDate) : undefined;
    if (status !== undefined)
        updateData.status = status;
    // Update the transfer
    const updatedTransfer = await transfers_model_1.Transfer.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updatedTransfer) {
        throw new error_utils_1.CustomError("Failed to update transfer", 500);
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
exports.deleteTransfer = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid transfer ID is required", 400);
    }
    // Check if transfer exists
    const existingTransfer = await transfers_model_1.Transfer.findById(id);
    if (!existingTransfer) {
        throw new error_utils_1.CustomError("Transfer not found", 404);
    }
    // Business Logic: Only allow hard delete for draft transfers
    if (existingTransfer.status !== "draft") {
        throw new error_utils_1.CustomError("Cannot delete transfer. Only draft transfers can be deleted. For non-draft transfers, use the cancel option instead.", 400);
    }
    // Delete all associated transfer entries first
    await transfer_entry_model_1.TransferEntry.deleteMany({ transferId: id });
    // Hard delete the transfer (permanently remove from database)
    const deletedTransfer = await transfers_model_1.Transfer.findByIdAndDelete(id);
    if (!deletedTransfer) {
        throw new error_utils_1.CustomError("Failed to delete transfer", 500);
    }
    return res.status(200).json({
        success: true,
        message: "Transfer and all associated entries deleted successfully"
    });
});
// POST /transfers/:id/ready-to-ship
exports.markTransferReadyToShip = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid transfer ID is required", 400);
    }
    const transfer = await transfers_model_1.Transfer.findById(id);
    if (!transfer)
        throw new error_utils_1.CustomError("Transfer not found", 404);
    if (transfer.status !== 'draft') {
        throw new error_utils_1.CustomError("Only draft transfers can be marked ready to ship", 400);
    }
    // Reserve inventory at origin for each entry quantity
    const originId = transfer.originLocationId;
    if (!originId)
        throw new error_utils_1.CustomError("Origin location not set on transfer", 400);
    const entries = await transfer_entry_model_1.TransferEntry.find({ transferId: transfer._id }).lean();
    for (const entry of entries) {
        const variantId = entry.variantId;
        if (!variantId)
            continue;
        // Fetch existing level
        const level = await inventory_level_model_1.InventoryLevelModel.findOne({ variantId, locationId: originId });
        if (!level)
            continue;
        const unavail = level.unavailable || { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 };
        const nextUnavailable = {
            ...unavail,
            other: Math.max(0, (unavail.other || 0) + entry.quantity)
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
