import { Request, Response } from 'express';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { ExportLog } from '../models/export-log.model';

/**
 * Log an export (called when any user exports data)
 * POST /api/export-log
 */
export const logExport = asyncErrorHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new CustomError('Unauthorized', 401);

  const { page, csvContent, fileName } = req.body;
  if (!page || !csvContent || !fileName) {
    throw new CustomError('page, csvContent, and fileName are required', 400);
  }

  // Limit CSV size to ~1MB to avoid huge documents
  if (typeof csvContent !== 'string' || csvContent.length > 1048576) {
    throw new CustomError('CSV content too large', 400);
  }

  const userId = user.id;
  const exportedByName = user.name || 'Unknown';
  const exportedByEmail = user.email || '';

  const log = await ExportLog.create({
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
export const listExportLogs = asyncErrorHandler(async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.superAdmin) throw new CustomError('Super-admin access required', 403);

  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    ExportLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-csvContent') // Exclude CSV content from list
      .lean(),
    ExportLog.countDocuments(),
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
export const downloadExport = asyncErrorHandler(async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.superAdmin) throw new CustomError('Super-admin access required', 403);

  const { id } = req.params;
  const log = await ExportLog.findById(id).lean();
  if (!log) throw new CustomError('Export not found', 404);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${log.fileName}"`);
  res.send(log.csvContent);
});
