"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = logActivity;
const activity_log_model_1 = require("../models/activity-log.model");
/**
 * Log a major admin action for super-admin audit.
 * Fire-and-forget: does not block the request.
 */
async function logActivity(req, params) {
    try {
        if (!req?.user)
            return;
        const user = req.user;
        const userId = user.id ?? (typeof user._id === 'string' ? user._id : user._id?.toString?.());
        if (!userId)
            return;
        const name = user.name || 'Unknown';
        const email = (user.email || '').toLowerCase();
        await activity_log_model_1.ActivityLog.create({
            performedBy: userId,
            performedByName: name,
            performedByEmail: email,
            action: params.action,
            entityType: params.entityType,
            entityId: params.entityId,
            entityName: params.entityName,
            summary: params.summary,
            details: params.details || {},
        });
    }
    catch (err) {
        console.warn('Activity log failed:', err);
    }
}
