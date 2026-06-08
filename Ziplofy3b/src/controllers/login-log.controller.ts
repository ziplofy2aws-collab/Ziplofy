import { Request, Response } from "express";
import { LoginLog } from "../models/login-log.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

export const getLoginLogs = asyncErrorHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search, startDate, endDate, success } = req.query;

  const query: any = {};

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
      query.loginTime.$gte = new Date(startDate as string);
    }
    if (endDate) {
      query.loginTime.$lte = new Date(endDate as string);
    }
  }

  // Filter by success status
  if (success !== undefined) {
    query.success = success === 'true';
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [logs, total] = await Promise.all([
    LoginLog.find(query)
      .sort({ loginTime: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email status'),
    LoginLog.countDocuments(query)
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

export const getLoginStats = asyncErrorHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  const matchQuery: any = {};
  if (startDate || endDate) {
    matchQuery.loginTime = {};
    if (startDate) {
      matchQuery.loginTime.$gte = new Date(startDate as string);
    }
    if (endDate) {
      matchQuery.loginTime.$lte = new Date(endDate as string);
    }
  }

  const stats = await LoginLog.aggregate([
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

export const getRecentLogins = asyncErrorHandler(async (req: Request, res: Response) => {
  const { limit = 20 } = req.query;

  const recentLogins = await LoginLog.find({ success: true })
    .sort({ loginTime: -1 })
    .limit(Number(limit))
    .populate('userId', 'name email status')
    .select('email name loginTime ipAddress userAgent loginMethod');

  res.status(200).json({
    success: true,
    data: recentLogins
  });
});
