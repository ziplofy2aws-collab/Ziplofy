import { Router } from 'express';
import { getNotificationOptionsByCategoryId } from '../controllers/notification-option.controller';

const notificationOptionRouter = Router();

// GET /api/notification-options?categoryId=...
notificationOptionRouter.get('/', getNotificationOptionsByCategoryId);

export default notificationOptionRouter;

