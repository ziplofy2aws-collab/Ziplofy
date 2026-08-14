import { Router } from 'express';
import {
  getAnalyticsAovOverTime,
  getAnalyticsContent,
  getAnalyticsCustomers,
  getAnalyticsInventory,
  getAnalyticsProducts,
  getAnalyticsInsights,
  getAnalyticsSalesByProduct,
  getAnalyticsSalesOverTime,
  getAnalyticsSummary,
} from '../controllers/analytics.controller';
import { protect } from '../middlewares/auth.middleware';

export const analyticsRouter = Router();
analyticsRouter.use(protect);

// GET /api/analytics/summary?storeId=&from=&to=
analyticsRouter.get('/summary', getAnalyticsSummary);

// GET /api/analytics/sales-over-time?storeId=&from=&to=
analyticsRouter.get('/sales-over-time', getAnalyticsSalesOverTime);

// GET /api/analytics/aov-over-time?storeId=&from=&to=
analyticsRouter.get('/aov-over-time', getAnalyticsAovOverTime);

// GET /api/analytics/sales-by-product?storeId=&from=&to=&limit=
analyticsRouter.get('/sales-by-product', getAnalyticsSalesByProduct);

// GET /api/analytics/insights?storeId=&from=&to=
analyticsRouter.get('/insights', getAnalyticsInsights);

// GET /api/analytics/customers?storeId=&from=&to=
analyticsRouter.get('/customers', getAnalyticsCustomers);

// GET /api/analytics/content?storeId=&from=&to=
analyticsRouter.get('/content', getAnalyticsContent);

// GET /api/analytics/products?storeId=&from=&to=
analyticsRouter.get('/products', getAnalyticsProducts);

// GET /api/analytics/inventory?storeId=&from=&to=
analyticsRouter.get('/inventory', getAnalyticsInventory);

