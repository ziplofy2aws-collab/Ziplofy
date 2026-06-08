"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductType = exports.getProductTypesByStoreId = exports.createProductType = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const product_type_model_1 = require("../models/product-type/product-type.model");
const error_utils_1 = require("../utils/error.utils");
// Create product type
exports.createProductType = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, name } = req.body;
    if (!storeId || !name) {
        throw new error_utils_1.CustomError('storeId and name are required', 400);
    }
    if (!mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Invalid storeId', 400);
    }
    const productType = await product_type_model_1.ProductType.create({ storeId, name });
    res.status(201).json({
        success: true,
        data: productType,
        message: 'Product type created successfully'
    });
});
// Get product types by store ID
exports.getProductTypesByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const productTypes = await product_type_model_1.ProductType.find({ storeId }).sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: productTypes,
        count: productTypes.length,
        message: 'Product types fetched successfully'
    });
});
// Delete product type
exports.deleteProductType = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid product type ID is required', 400);
    }
    const productType = await product_type_model_1.ProductType.findByIdAndDelete(id);
    if (!productType) {
        throw new error_utils_1.CustomError('Product type not found', 404);
    }
    res.status(200).json({
        success: true,
        data: productType,
        message: 'Product type deleted successfully'
    });
});
