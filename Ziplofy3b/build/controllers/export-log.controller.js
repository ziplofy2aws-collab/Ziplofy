"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadExport = exports.listExportLogs = exports.logExport = void 0;
const error_utils_1 = require("../utils/error.utils");
const export_log_model_1 = require("../models/export-log.model");
/**
 * Log an export (called when any user exports data)
 * POST /api/export-log
 */
exports.logExport = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const user = req.user;
    if (!user)
        throw new error_utils_1.CustomError('Unauthorized', 401);
    const { page, csvContent, fileName } = req.body;
    if (!page || !csvContent || !fileName) {
        throw new error_utils_1.CustomError('page, csvContent, and fileName are required', 400);
    }
    // Limit CSV size to ~1MB to avoid huge documents
    if (typeof csvContent !== 'string' || csvContent.length > 1048576) {
        throw new error_utils_1.CustomError('CSV content too large', 400);
    }
    const userId = user.id;
    const exportedByName = user.name || 'Unknown';
    const exportedByEmail = user.email || '';
    const log = await export_log_model_1.ExportLog.create({
        exportedBy: userId,
        exportedByName,
        exportedByEmail,
        page,
        csvContent,
        fileName,
    });
    res.status(201).json({
        success: true,
        data: { _id: log._id, createdAt: log.createdAt },
    });
});
/**
 * List export logs (super-admin only)
 * GET /api/export-log
 */
exports.listExportLogs = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const user = req.user;
    if (!user?.superAdmin)
        throw new error_utils_1.CustomError('Super-admin access required', 403);
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
        export_log_model_1.ExportLog.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-csvContent') // Exclude CSV content from list
            .lean(),
        export_log_model_1.ExportLog.countDocuments(),
    ]);
    res.status(200).json({
        success: true,
        data: logs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    });
});
/**
 * Download a specific export (super-admin only)
 * GET /api/export-log/:id/download
 */
exports.downloadExport = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const user = req.user;
    if (!user?.superAdmin)
        throw new error_utils_1.CustomError('Super-admin access required', 403);
    const { id } = req.params;
    const log = await export_log_model_1.ExportLog.findById(id).lean();
    if (!log)
        throw new error_utils_1.CustomError('Export not found', 404);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${log.fileName}"`);
    res.send(log.csvContent);
});
