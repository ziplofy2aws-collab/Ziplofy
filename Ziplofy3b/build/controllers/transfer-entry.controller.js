"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransferEntriesByTransferId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const transfer_entry_model_1 = require("../models/transfer-entry/transfer-entry.model");
const error_utils_1 = require("../utils/error.utils");
const product_model_1 = require("../models/product/product.model");
const transfers_model_1 = require("../models/transfers/transfers.model");
const inventory_level_model_1 = require("../models/inventory-level/inventory-level.model");
exports.getTransferEntriesByTransferId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid transferId is required", 400);
    }
    const entries = await transfer_entry_model_1.TransferEntry.find({ transferId: new mongoose_1.default.Types.ObjectId(id) })
        .sort({ createdAt: -1 })
        .populate({
        path: "variantId",
        select: "sku optionValues price images productId"
    });
    // Get all unique product IDs from the entries
    const productIds = [...new Set(entries.map(entry => entry.variantId?.productId).filter(Boolean))];
    console.log('product ids are', productIds);
    // Fetch product names separately
    const products = await product_model_1.Product.find({ _id: { $in: productIds } }).select("title");
    // Create a map of product ID to product name
    const productMap = products.reduce((map, product) => {
        map[product._id.toString()] = product.title;
        return map;
    }, {});
    // Resolve origin location for this transfer
    const transferDoc = await transfers_model_1.Transfer.findById(id).select({ originLocationId: 1 });
    const originLocationId = transferDoc?.originLocationId ? new mongoose_1.default.Types.ObjectId(String(transferDoc.originLocationId)) : null;
    // Fetch inventory levels at origin for all variants in this transfer
    let atOriginMap = new Map();
    if (originLocationId) {
        const variantIds = entries.map(e => e.variantId?._id).filter(Boolean);
        if (variantIds.length > 0) {
            const levels = await inventory_level_model_1.InventoryLevelModel.find({
                variantId: { $in: variantIds },
                locationId: originLocationId,
            }).select({ variantId: 1, available: 1 }).lean();
            atOriginMap = new Map(levels.map(lvl => [String(lvl.variantId), Number(lvl.available) || 0]));
        }
    }
    // Attach product names and atOrigin to entries
    const entriesWithProductNames = entries.map(entry => {
        const entryObj = entry.toObject();
        if (entryObj.variantId && entryObj.variantId.productId) {
            entryObj.variantId.productName = productMap[entryObj.variantId.productId.toString()] || null;
        }
        // Ensure optionValues (Map) is serialized to a plain object
        if (entry.variantId && entry.variantId.optionValues) {
            const raw = entry.variantId.optionValues;
            if (raw instanceof Map) {
                entryObj.variantId.optionValues = Object.fromEntries(raw);
            }
        }
        // add atOrigin from inventory levels (default 0 if not found)
        const vId = entryObj.variantId?._id ? String(entryObj.variantId._id) : null;
        entryObj.atOrigin = vId && atOriginMap.has(vId) ? atOriginMap.get(vId) : 0;
        return entryObj;
    });
    return res.status(200).json({ success: true, data: entriesWithProductNames });
});
