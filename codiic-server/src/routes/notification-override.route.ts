import { Router } from 'express';
import {
  checkNotificationOverrideExists,
  createNotificationOverride,
  deleteNotificationOverride,
} from '../controllers/notification-override.controller';

const notificationOverrideRouter = Router();

// GET /api/notification-overrides/exists?storeId=...&optionId=...
notificationOverrideRouter.get('/exists', checkNotificationOverrideExists);

// POST /api/notification-overrides
notificationOverrideRouter.post('/', createNotificationOverride);

// DELETE /api/notification-overrides/:id
notificationOverrideRouter.delete('/:id', deleteNotificationOverride);

export default notificationOverrideRouter;


