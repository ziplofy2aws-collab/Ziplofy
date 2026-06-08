"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNewSecurityCode = exports.updateSecuritySettings = exports.getSecuritySettingsByStoreId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const store_security_settings_model_1 = require("../models/store-security-settings/store-security-settings.model");
const error_utils_1 = require("../utils/error.utils");
// Helper function to generate a random 8-character alphanumeric security code
const generateSecurityCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};
// GET /api/store-security-settings/:storeId
exports.getSecuritySettingsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    let settings = await store_security_settings_model_1.StoreSecuritySettings.findOne({ storeId }).lean();
    // If settings don't exist, create them with default values
    if (!settings) {
        const newSettings = await store_security_settings_model_1.StoreSecuritySettings.create({
            storeId,
            requireCode: false,
            securityCode: null,
            codeGeneratedAt: null,
        });
        settings = newSettings.toObject();
        return res.status(200).json({ success: true, data: settings, message: 'Security settings created and fetched successfully' });
    }
    return res.status(200).json({ success: true, data: settings, message: 'Security settings fetched successfully' });
});
// PATCH /api/store-security-settings/:id
exports.updateSecuritySettings = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Invalid id', 400);
    }
    const { requireCode } = req.body;
    if (requireCode === undefined) {
        throw new error_utils_1.CustomError('requireCode is required', 400);
    }
    const existing = await store_security_settings_model_1.StoreSecuritySettings.findById(id);
    if (!existing)
        throw new error_utils_1.CustomError('Security settings not found', 404);
    const payload = {
        requireCode: Boolean(requireCode),
    };
    // Generate code if requireCode is true and no code exists
    if (Boolean(requireCode) && !existing.securityCode) {
        payload.securityCode = generateSecurityCode();
        payload.codeGeneratedAt = new Date();
    }
    else if (!Boolean(requireCode)) {
        // If requireCode is false, clear the code
        payload.securityCode = null;
        payload.codeGeneratedAt = null;
    }
    const updated = await store_security_settings_model_1.StoreSecuritySettings.findByIdAndUpdate(id, { $set: payload }, { new: true });
    if (!updated)
        throw new error_utils_1.CustomError('Security settings not found', 404);
    return res.status(200).json({ success: true, data: updated, message: 'Security settings updated successfully' });
});
// GET /api/store-security-settings/:id/generateNewCode
exports.generateNewSecurityCode = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Invalid id', 400);
    }
    const newCode = generateSecurityCode();
    const updated = await store_security_settings_model_1.StoreSecuritySettings.findByIdAndUpdate(id, {
        $set: {
            securityCode: newCode,
            codeGeneratedAt: new Date(),
        },
    }, { new: true });
    if (!updated)
        throw new error_utils_1.CustomError('Security settings not found', 404);
    return res.status(200).json({
        success: true,
        data: updated,
        message: 'New security code generated successfully',
    });
});
