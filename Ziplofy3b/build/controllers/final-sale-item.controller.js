"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFinalSaleItemsByReturnRulesId = exports.deleteFinalSaleItem = exports.createFinalSaleItem = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const final_sale_item_model_1 = require("../models/final-sale-item/final-sale-item.model");
const return_rules_model_1 = require("../models/return-rules/return-rules.model");
const error_utils_1 = require("../utils/error.utils");
// POST /final-sale-items
exports.createFinalSaleItem = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const body = req.body;
    if (!body?.returnRulesId || !mongoose_1.default.isValidObjectId(body.returnRulesId))
        throw new error_utils_1.CustomError('Valid returnRulesId is required', 400);
    if (!body?.storeId || !mongoose_1.default.isValidObjectId(body.storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    if (!body.productVariantId && !body.collectionId)
        throw new error_utils_1.CustomError('Either productVariantId or collectionId must be provided', 400);
    if (body.productVariantId) {
        if (!mongoose_1.default.isValidObjectId(body.productVariantId))
            throw new error_utils_1.CustomError('Valid productVariantId is required', 400);
        const existing = await final_sale_item_model_1.FinalSaleItem.findOne({
            returnRulesId: body.returnRulesId,
            productVariantId: body.productVariantId,
        });
        if (existing)
            throw new error_utils_1.CustomError('This product variant is already marked as final sale', 409);
    }
    if (body.collectionId) {
        if (!mongoose_1.default.isValidObjectId(body.collectionId))
            throw new error_utils_1.CustomError('Valid collectionId is required', 400);
        const existing = await final_sale_item_model_1.FinalSaleItem.findOne({
            returnRulesId: body.returnRulesId,
            collectionId: body.collectionId,
        });
        if (existing)
            throw new error_utils_1.CustomError('This collection is already marked as final sale', 409);
    }
    const doc = await final_sale_item_model_1.FinalSaleItem.create({
        returnRulesId: body.returnRulesId,
        storeId: body.storeId,
        productVariantId: body.productVariantId || null,
        collectionId: body.collectionId || null,
    });
    return res.status(201).json({ success: true, data: doc, message: 'Final sale item created' });
});
// DELETE /final-sale-items/:id
exports.deleteFinalSaleItem = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id))
        throw new error_utils_1.CustomError('Valid id is required', 400);
    const deleted = await final_sale_item_model_1.FinalSaleItem.findByIdAndDelete(id);
    if (!deleted)
        throw new error_utils_1.CustomError('Final sale item not found', 404);
    return res.status(200).json({ success: true, data: { deletedId: id }, message: 'Final sale item deleted' });
});
// GET /final-sale-items/return-rules/:returnRulesId
exports.getFinalSaleItemsByReturnRulesId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { returnRulesId } = req.params;
    if (!returnRulesId || !mongoose_1.default.isValidObjectId(returnRulesId))
        throw new error_utils_1.CustomError('Valid returnRulesId is required', 400);
    const rule = await return_rules_model_1.ReturnRules.findById(returnRulesId).select({ finalSaleSelection: 1 });
    const selection = rule?.finalSaleSelection === 'products' ? 'products' : 'collections';
    const filter = { returnRulesId };
    if (selection === 'collections') {
        filter.collectionId = { $ne: null };
        filter.productVariantId = null;
    }
    else {
        filter.productVariantId = { $ne: null };
        filter.collectionId = null;
    }
    let query = final_sale_item_model_1.FinalSaleItem.find(filter).sort({ createdAt: -1 });
    if (selection === 'collections') {
        query = query.populate('collectionId', 'title image');
    }
    else {
        query = query.populate({
            path: 'productVariantId',
            populate: { path: 'productId', select: 'title imageUrls' },
        });
    }
    const items = await query;
    return res.status(200).json({ success: true, data: items, message: 'Final sale items fetched' });
});
