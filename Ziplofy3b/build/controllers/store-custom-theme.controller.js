"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStoreCustomTheme = exports.updateStoreCustomTheme = exports.getStoreCustomThemesByStoreId = exports.createStoreCustomTheme = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const store_custom_theme_model_1 = require("../models/store-custom-theme/store-custom-theme.model");
const error_utils_1 = require("../utils/error.utils");
function parseThemeConfig(raw) {
    if (raw === null || raw === undefined) {
        throw new error_utils_1.CustomError('themeConfig is required', 400);
    }
    if (typeof raw !== 'object' || Array.isArray(raw)) {
        throw new error_utils_1.CustomError('themeConfig must be a JSON object', 400);
    }
    return raw;
}
function parseOptionalThemeDesc(raw) {
    if (raw === undefined || raw === null)
        return undefined;
    if (typeof raw !== 'string') {
        throw new error_utils_1.CustomError('themeDesc must be a string', 400);
    }
    const trimmed = raw.trim();
    return trimmed.length ? trimmed : undefined;
}
exports.createStoreCustomTheme = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, themeConfig, themeName, themeDesc } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const name = typeof themeName === 'string' ? themeName.trim() : '';
    if (!name) {
        throw new error_utils_1.CustomError('themeName is required', 400);
    }
    const config = parseThemeConfig(themeConfig);
    const desc = parseOptionalThemeDesc(themeDesc);
    const created = await store_custom_theme_model_1.StoreCustomTheme.create({
        storeId,
        themeName: name,
        ...(desc !== undefined ? { themeDesc: desc } : {}),
        themeConfig: config,
    });
    res.status(201).json({
        success: true,
        message: 'Store custom theme created',
        data: created,
    });
});
exports.getStoreCustomThemesByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const items = await store_custom_theme_model_1.StoreCustomTheme.find({ storeId }).sort({ updatedAt: -1 }).lean();
    res.status(200).json({
        success: true,
        message: 'Store custom themes retrieved',
        data: items,
        count: items.length,
    });
});
exports.updateStoreCustomTheme = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { themeConfig, themeName, themeDesc } = req.body;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid id is required', 400);
    }
    const set = {};
    const unset = {};
    if (themeConfig !== undefined) {
        set.themeConfig = parseThemeConfig(themeConfig);
    }
    if (themeName !== undefined) {
        const name = String(themeName).trim();
        if (!name)
            throw new error_utils_1.CustomError('themeName cannot be empty', 400);
        set.themeName = name;
    }
    if (themeDesc !== undefined) {
        if (themeDesc === null || (typeof themeDesc === 'string' && !themeDesc.trim())) {
            unset.themeDesc = 1;
        }
        else {
            const desc = parseOptionalThemeDesc(themeDesc);
            if (desc)
                set.themeDesc = desc;
            else
                unset.themeDesc = 1;
        }
    }
    if (Object.keys(set).length === 0 && Object.keys(unset).length === 0) {
        throw new error_utils_1.CustomError('Provide themeConfig, themeName, and/or themeDesc to update', 400);
    }
    const updated = await store_custom_theme_model_1.StoreCustomTheme.findByIdAndUpdate(id, {
        ...(Object.keys(set).length ? { $set: set } : {}),
        ...(Object.keys(unset).length ? { $unset: unset } : {}),
    }, {
        new: true,
        runValidators: true,
    });
    if (!updated) {
        throw new error_utils_1.CustomError('Store custom theme not found', 404);
    }
    res.status(200).json({
        success: true,
        message: 'Store custom theme updated',
        data: updated,
    });
});
exports.deleteStoreCustomTheme = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid id is required', 400);
    }
    const deleted = await store_custom_theme_model_1.StoreCustomTheme.findByIdAndDelete(id);
    if (!deleted) {
        throw new error_utils_1.CustomError('Store custom theme not found', 404);
    }
    res.status(200).json({
        success: true,
        message: 'Store custom theme deleted',
        data: { deletedId: id },
    });
});
