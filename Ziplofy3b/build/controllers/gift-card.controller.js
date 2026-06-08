"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGiftCard = exports.updateGiftCard = exports.getGiftCardsByStoreId = exports.createGiftCard = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const gift_card_model_1 = require("../models/gift-cards/gift-card.model");
const error_utils_1 = require("../utils/error.utils");
// Create gift card
exports.createGiftCard = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, code, initialValue, expirationDate, notes, isActive } = req.body;
    if (!storeId || !code || initialValue === undefined) {
        throw new error_utils_1.CustomError('storeId, code and initialValue are required', 400);
    }
    if (!mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Invalid storeId', 400);
    }
    if (initialValue < 0) {
        throw new error_utils_1.CustomError('initialValue cannot be negative', 400);
    }
    // Check if expiration date is in the future
    if (expirationDate && new Date(expirationDate) <= new Date()) {
        throw new error_utils_1.CustomError('expirationDate must be in the future', 400);
    }
    const giftCard = await gift_card_model_1.GiftCard.create({
        storeId,
        code,
        initialValue,
        expirationDate: expirationDate ? new Date(expirationDate) : undefined,
        notes,
        isActive: isActive !== undefined ? isActive : true
    });
    res.status(201).json({
        success: true,
        data: giftCard,
        message: 'Gift card created successfully'
    });
});
// Get gift cards by store id
exports.getGiftCardsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId) {
        throw new error_utils_1.CustomError('storeId is required', 400);
    }
    if (!mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Invalid storeId', 400);
    }
    const giftCards = await gift_card_model_1.GiftCard.find({ storeId })
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: giftCards,
        count: giftCards.length
    });
});
// Update gift card
exports.updateGiftCard = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { code, initialValue, expirationDate, notes, isActive } = req.body;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Invalid gift card id', 400);
    }
    // First, check if the gift card exists and is active
    const existingGiftCard = await gift_card_model_1.GiftCard.findById(id);
    if (!existingGiftCard) {
        throw new error_utils_1.CustomError('Gift card not found', 404);
    }
    // Check if gift card is deactivated
    if (!existingGiftCard.isActive) {
        return res.status(403).json({
            success: false,
            message: 'Gift card deactivated, no actions can be done now'
        });
    }
    if (initialValue !== undefined && initialValue < 0) {
        throw new error_utils_1.CustomError('initialValue cannot be negative', 400);
    }
    // Check if expiration date is in the future
    if (expirationDate && new Date(expirationDate) <= new Date()) {
        throw new error_utils_1.CustomError('expirationDate must be in the future', 400);
    }
    const updateData = {};
    if (code !== undefined)
        updateData.code = code;
    if (initialValue !== undefined)
        updateData.initialValue = initialValue;
    if (expirationDate !== undefined) {
        updateData.expirationDate = expirationDate ? new Date(expirationDate) : null;
    }
    if (notes !== undefined)
        updateData.notes = notes;
    if (isActive !== undefined)
        updateData.isActive = isActive;
    const giftCard = await gift_card_model_1.GiftCard.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!giftCard) {
        throw new error_utils_1.CustomError('Gift card not found', 404);
    }
    res.status(200).json({
        success: true,
        data: giftCard,
        message: 'Gift card updated successfully'
    });
});
// Soft delete gift card (set isActive to false)
exports.deleteGiftCard = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Invalid gift card id', 400);
    }
    // First, check if the gift card exists
    const existingGiftCard = await gift_card_model_1.GiftCard.findById(id);
    if (!existingGiftCard) {
        throw new error_utils_1.CustomError('Gift card not found', 404);
    }
    // Check if gift card is already deactivated
    if (!existingGiftCard.isActive) {
        return res.status(403).json({
            success: false,
            message: 'Gift card already deactivated, no actions can be done now'
        });
    }
    const giftCard = await gift_card_model_1.GiftCard.findByIdAndUpdate(id, { isActive: false }, { new: true, runValidators: true });
    if (!giftCard) {
        throw new error_utils_1.CustomError('Gift card not found', 404);
    }
    res.status(200).json({
        success: true,
        data: {
            deletedGiftCard: {
                id: giftCard._id,
                code: giftCard.code,
                initialValue: giftCard.initialValue,
                isActive: giftCard.isActive
            }
        },
        message: 'Gift card deactivated successfully'
    });
});
