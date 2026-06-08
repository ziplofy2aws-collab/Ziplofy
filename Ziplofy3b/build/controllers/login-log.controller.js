"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentLogins = exports.getLoginStats = exports.getLoginLogs = void 0;
const login_log_model_1 = require("../models/login-log.model");
const error_utils_1 = require("../utils/error.utils");
exports.getLoginLogs = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { page = 1, limit = 10, search, startDate, endDate, success } = req.query;
    const query = {};
    // Search by email or name
    if (search) {
        query.$or = [
            { email: { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } }
        ];
    }
    // Filter by date range
    if (startDate || endDate) {
        query.loginTime = {};
        if (startDate) {
            query.loginTime.$gte = new Date(startDate);
        }
        if (endDate) {
            query.loginTime.$lte = new Date(endDate);
        }
    }
    // Filter by success status
    if (success !== undefined) {
        query.success = success === 'true';
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
        login_log_model_1.LoginLog.find(query)
            .sort({ loginTime: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('userId', 'name email status'),
        login_log_model_1.LoginLog.countDocuments(query)
    ]);
    res.status(200).json({
        success: true,
        data: {
            logs,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        }
    });
});
exports.getLoginStats = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { startDate, endDate } = req.query;
    const matchQuery = {};
    if (startDate || endDate) {
        matchQuery.loginTime = {};
        if (startDate) {
            matchQuery.loginTime.$gte = new Date(startDate);
        }
        if (endDate) {
            matchQuery.loginTime.$lte = new Date(endDate);
        }
    }
    const stats = await login_log_model_1.LoginLog.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: null,
                totalLogins: { $sum: 1 },
                successfulLogins: { $sum: { $cond: ['$success', 1, 0] } },
                failedLogins: { $sum: { $cond: ['$success', 0, 1] } },
                uniqueUsers: { $addToSet: '$userId' }
            }
        },
        {
            $project: {
                _id: 0,
                totalLogins: 1,
                successfulLogins: 1,
                failedLogins: 1,
                uniqueUsers: { $size: '$uniqueUsers' }
            }
        }
    ]);
    const result = stats[0] || {
        totalLogins: 0,
        successfulLogins: 0,
        failedLogins: 0,
        uniqueUsers: 0
    };
    res.status(200).json({
        success: true,
        data: result
    });
});
exports.getRecentLogins = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { limit = 20 } = req.query;
    const recentLogins = await login_log_model_1.LoginLog.find({ success: true })
        .sort({ loginTime: -1 })
        .limit(Number(limit))
        .populate('userId', 'name email status')
        .select('email name loginTime ipAddress userAgent loginMethod');
    res.status(200).json({
        success: true,
        data: recentLogins
    });
});
