import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import {
  logExportActivity,
  listActivityLogs,
  getActivityLogDetail,
  downloadExportFromActivity,
} from '../controllers/activity-log.controller';

export const activityLogRouter = Router();

activityLogRouter.use(protect);

// Log export (any authenticated admin)
activityLogRouter.post('/export', logExportActivity);

// Super-admin only - checked in controller
activityLogRouter.get('/:id/download', downloadExportFromActivity);
activityLogRouter.get('/:id', getActivityLogDetail);
activityLogRouter.get('/', listActivityLogs);
