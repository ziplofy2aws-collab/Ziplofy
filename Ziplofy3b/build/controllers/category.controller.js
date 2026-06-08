"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoriesByParentId = exports.getBaseCategories = void 0;
const category_model_1 = require("../models/category/category.model");
const error_utils_1 = require("../utils/error.utils");
// Get all base (root-level) categories (parent === null)
exports.getBaseCategories = (0, error_utils_1.asyncErrorHandler)(async (_req, res) => {
    const categories = await category_model_1.Category.find({ parent: null }).sort({ name: 1 });
    res.status(200).json({
        success: true,
        data: categories,
        count: categories.length,
    });
});
// Get categories by parent id
exports.getCategoriesByParentId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { parentId } = req.params;
    if (!parentId) {
        throw new error_utils_1.CustomError("Parent id is required", 400);
    }
    const categories = await category_model_1.Category.find({ parent: parentId }).sort({ name: 1 });
    res.status(200).json({
        success: true,
        data: categories,
        count: categories.length,
    });
});
