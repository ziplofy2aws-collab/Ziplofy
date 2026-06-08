import { Request } from 'express';
import { ActivityLog } from '../models/activity-log.model';

export interface LogActivityParams {
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  summary: string;
  details?: Record<string, unknown>;
}

/**
 * Log a major admin action for super-admin audit.
 * Fire-and-forget: does not block the request.
 */
export async function logActivity(req: Request | null, params: LogActivityParams): Promise<void> {
  try {
    if (!req?.user) return;

    const user = req.user as { id?: string; _id?: unknown; name?: string; email?: string };
    const userId = user.id ?? (typeof user._id === 'string' ? user._id : (user._id as { toString?: () => string })?.toString?.());
    if (!userId) return;

    const name = user.name || 'Unknown';
    const email = (user.email || '').toLowerCase();

    await ActivityLog.create({
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
  } catch (err) {
    console.warn('Activity log failed:', err);
  }
}
