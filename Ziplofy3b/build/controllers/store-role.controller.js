"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.updateRole = exports.createRole = exports.getRolesByStoreId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const store_role_model_1 = require("../models/store-role/store-role.model");
const error_utils_1 = require("../utils/error.utils");
// GET /api/store-roles?storeId=...
exports.getRolesByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.query;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const roles = await store_role_model_1.StoreRole.find({ storeId }).sort({ isDefault: -1, name: 1 }).lean();
    return res.status(200).json({ success: true, data: roles, message: 'Roles fetched successfully' });
});
// POST /api/store-roles
exports.createRole = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, name, description, permissions, isDefault } = req.body || {};
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    if (!name) {
        throw new error_utils_1.CustomError('Role name is required', 400);
    }
    const role = await store_role_model_1.StoreRole.create({
        storeId,
        name: String(name).trim(),
        description: description ? String(description).trim() : undefined,
        permissions: Array.isArray(permissions) ? permissions : [],
        isDefault: Boolean(isDefault),
    });
    return res.status(201).json({ success: true, data: role, message: 'Role created successfully' });
});
// PATCH /api/store-roles/:roleId
exports.updateRole = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { roleId } = req.params;
    if (!mongoose_1.default.isValidObjectId(roleId)) {
        throw new error_utils_1.CustomError('Invalid roleId', 400);
    }
    const payload = {};
    if (req.body.name !== undefined)
        payload.name = String(req.body.name).trim();
    if (req.body.description !== undefined)
        payload.description = String(req.body.description).trim();
    if (req.body.permissions !== undefined)
        payload.permissions = Array.isArray(req.body.permissions) ? req.body.permissions : [];
    if (req.body.isDefault !== undefined)
        payload.isDefault = Boolean(req.body.isDefault);
    const updated = await store_role_model_1.StoreRole.findByIdAndUpdate(roleId, { $set: payload }, { new: true });
    if (!updated)
        throw new error_utils_1.CustomError('Role not found', 404);
    return res.status(200).json({ success: true, data: updated, message: 'Role updated successfully' });
});
// DELETE /api/store-roles/:roleId
exports.deleteRole = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { roleId } = req.params;
    if (!mongoose_1.default.isValidObjectId(roleId)) {
        throw new error_utils_1.CustomError('Invalid roleId', 400);
    }
    const deleted = await store_role_model_1.StoreRole.findByIdAndDelete(roleId);
    if (!deleted)
        throw new error_utils_1.CustomError('Role not found', 404);
    return res.status(200).json({ success: true, data: deleted, message: 'Role deleted successfully' });
});
