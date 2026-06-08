"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadExportFromActivity = exports.getActivityLogDetail = exports.listActivityLogs = exports.logExportActivity = void 0;
const error_utils_1 = require("../utils/error.utils");
const activity_log_model_1 = require("../models/activity-log.model");
/**
 * Log an export (called by frontend when any admin exports data)
 * POST /api/activity-logs/export
 */
exports.logExportActivity = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const user = req.user;
    if (!user)
        throw new error_utils_1.CustomError('Unauthorized', 401);
    const { page, csvContent, fileName } = req.body;
    if (!page || !csvContent || !fileName) {
        throw new error_utils_1.CustomError('page, csvContent, and fileName are required', 400);
    }
    const maxCsvSize = 1048576; // 1MB
    if (typeof csvContent !== 'string' || csvContent.length > maxCsvSize) {
        throw new error_utils_1.CustomError('CSV content too large', 400);
    }
    const u = req.user;
    await activity_log_model_1.ActivityLog.create({
        performedBy: u.id,
        performedByName: u.name || 'Unknown',
        performedByEmail: u.email || '',
        action: 'export',
        entityType: 'export',
        entityName: fileName,
        summary: `Exported data from ${page} as ${fileName}`,
        details: { page, fileName, csvContent },
    });
    res.status(201).json({ success: true, message: 'Export logged' });
});
/**
 * List activity logs (super-admin only)
 * GET /api/activity-logs
 */
exports.listActivityLogs = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const user = req.user;
    if (!user?.superAdmin)
        throw new error_utils_1.CustomError('Super-admin access required', 403);
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;
    const action = req.query.action;
    const filter = {};
    if (action)
        filter.action = action;
    const [rawLogs, total] = await Promise.all([
        activity_log_model_1.ActivityLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        activity_log_model_1.ActivityLog.countDocuments(filter),
    ]);
    // Strip csvContent from list to avoid huge payloads (full details available via GET /:id)
    const logs = rawLogs.map((log) => {
        if (log.action === 'export' && log.details?.csvContent) {
            const { csvContent, ...rest } = log.details;
            return { ...log, details: rest };
        }
        return log;
    });
    res.status(200).json({
        success: true,
        data: logs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    });
});
/**
 * Get single activity log with full details (super-admin only)
 * GET /api/activity-logs/:id
 */
exports.getActivityLogDetail = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const user = req.user;
    if (!user?.superAdmin)
        throw new error_utils_1.CustomError('Super-admin access required', 403);
    const { id } = req.params;
    const log = await activity_log_model_1.ActivityLog.findById(id).lean();
    if (!log)
        throw new error_utils_1.CustomError('Activity log not found', 404);
    res.status(200).json({
        success: true,
        data: log,
    });
});
/**
 * Download exported CSV (super-admin only) - for activity logs with action "export"
 * GET /api/activity-logs/:id/download
 */
exports.downloadExportFromActivity = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const user = req.user;
    if (!user?.superAdmin)
        throw new error_utils_1.CustomError('Super-admin access required', 403);
    const { id } = req.params;
    const log = await activity_log_model_1.ActivityLog.findById(id).lean();
    if (!log)
        throw new error_utils_1.CustomError('Activity log not found', 404);
    if (log.action !== 'export')
        throw new error_utils_1.CustomError('This activity is not an export', 400);
    const details = log.details;
    const csvContent = details?.csvContent;
    const fileName = details?.fileName || `export-${id}.csv`;
    if (!csvContent || typeof csvContent !== 'string') {
        throw new error_utils_1.CustomError('Export content not available', 404);
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(csvContent);
});
