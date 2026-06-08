import { Request, Response } from 'express';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { ActivityLog } from '../models/activity-log.model';

/**
 * Log an export (called by frontend when any admin exports data)
 * POST /api/activity-logs/export
 */
export const logExportActivity = asyncErrorHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new CustomError('Unauthorized', 401);

  const { page, csvContent, fileName } = req.body as { page?: string; csvContent?: string; fileName?: string };
  if (!page || !csvContent || !fileName) {
    throw new CustomError('page, csvContent, and fileName are required', 400);
  }

  const maxCsvSize = 1048576; // 1MB
  if (typeof csvContent !== 'string' || csvContent.length > maxCsvSize) {
    throw new CustomError('CSV content too large', 400);
  }

  const u = req.user as { id: string; name?: string; email?: string };
  await ActivityLog.create({
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
export const listActivityLogs = asyncErrorHandler(async (req: Request, res: Response) => {
  const user = req.user as { superAdmin?: boolean };
  if (!user?.superAdmin) throw new CustomError('Super-admin access required', 403);

  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const skip = (page - 1) * limit;
  const action = req.query.action as string | undefined;

  const filter: Record<string, unknown> = {};
  if (action) filter.action = action;

  const [rawLogs, total] = await Promise.all([
    ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ActivityLog.countDocuments(filter),
  ]);

  // Strip csvContent from list to avoid huge payloads (full details available via GET /:id)
  const logs = rawLogs.map((log: any) => {
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
export const getActivityLogDetail = asyncErrorHandler(async (req: Request, res: Response) => {
  const user = req.user as { superAdmin?: boolean };
  if (!user?.superAdmin) throw new CustomError('Super-admin access required', 403);

  const { id } = req.params;
  const log = await ActivityLog.findById(id).lean();
  if (!log) throw new CustomError('Activity log not found', 404);

  res.status(200).json({
    success: true,
    data: log,
  });
});

/**
 * Download exported CSV (super-admin only) - for activity logs with action "export"
 * GET /api/activity-logs/:id/download
 */
export const downloadExportFromActivity = asyncErrorHandler(async (req: Request, res: Response) => {
  const user = req.user as { superAdmin?: boolean };
  if (!user?.superAdmin) throw new CustomError('Super-admin access required', 403);

  const { id } = req.params;
  const log = await ActivityLog.findById(id).lean();
  if (!log) throw new CustomError('Activity log not found', 404);
  if (log.action !== 'export') throw new CustomError('This activity is not an export', 400);

  const details = log.details as { csvContent?: string; fileName?: string };
  const csvContent = details?.csvContent;
  const fileName = details?.fileName || `export-${id}.csv`;

  if (!csvContent || typeof csvContent !== 'string') {
    throw new CustomError('Export content not available', 404);
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(csvContent);
});
