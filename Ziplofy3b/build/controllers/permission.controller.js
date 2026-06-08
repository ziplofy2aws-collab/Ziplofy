"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPermissions = void 0;
const permission_definition_model_1 = require("../models/permission/permission-definition.model");
const error_utils_1 = require("../utils/error.utils");
// GET /api/permissions
exports.getAllPermissions = (0, error_utils_1.asyncErrorHandler)(async (_req, res) => {
    const permissions = await permission_definition_model_1.PermissionDefinition.find({})
        .sort({ resource: 1, parentKey: 1, order: 1, key: 1 })
        .lean();
    return res.status(200).json({
        success: true,
        data: permissions,
        message: 'Permissions fetched successfully',
    });
});
