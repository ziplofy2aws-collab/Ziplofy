import { Router } from 'express';
import { getAllNotificationCategories } from '../controllers/notification-category.controller';

const notificationCategoryRouter = Router();

// GET /api/notification-categories
notificationCategoryRouter.get('/', getAllNotificationCategories);

export default notificationCategoryRouter;


