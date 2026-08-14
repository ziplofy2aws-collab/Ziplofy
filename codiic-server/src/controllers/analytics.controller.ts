import { Request, Response } from 'express';
import { getStoreContentAnalytics } from '../services/analytics/analytics-content.service';
import { getStoreCustomerAnalytics } from '../services/analytics/analytics-customers.service';
import { getStoreInventoryAnalytics } from '../services/analytics/analytics-inventory.service';
import { getStoreProductAnalytics } from '../services/analytics/analytics-products.service';
import { getStoreAnalyticsInsights } from '../services/analytics/analytics-insights.service';
import {
  getStoreAnalyticsSummary,
  getStoreAovOverTime,
  getStoreSalesByProduct,
  getStoreSalesOverTime,
} from '../services/analytics/analytics-summary.service';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

function parseDayBound(value: unknown, bound: 'start' | 'end'): Date {
  if (typeof value !== 'string' || !value.trim()) {
    throw new CustomError(`Query param "${bound === 'start' ? 'from' : 'to'}" is required (ISO date)`, 400);
  }
  const trimmed = value.trim();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (ymd) {
    const year = Number(ymd[1]);
    const month = Number(ymd[2]) - 1;
    const day = Number(ymd[3]);
    if (bound === 'start') {
      return new Date(year, month, day, 0, 0, 0, 0);
    }
    return new Date(year, month, day, 23, 59, 59, 999);
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new CustomError(`Query param "${bound === 'start' ? 'from' : 'to'}" must be a valid date`, 400);
  }
  if (bound === 'start') {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0);
  }
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 23, 59, 59, 999);
}

function parseRangeQuery(req: Request) {
  const storeId = typeof req.query.storeId === 'string' ? req.query.storeId : '';
  const from = parseDayBound(req.query.from, 'start');
  const to = parseDayBound(req.query.to, 'end');
  const timezone =
    typeof req.query.timezone === 'string' && req.query.timezone.trim()
      ? req.query.timezone.trim()
      : undefined;
  return { storeId, from, to, timezone };
}

/**
 * GET /api/analytics/summary?storeId=&from=&to=
 */
export const getAnalyticsSummary = asyncErrorHandler(async (req: Request, res: Response) => {
  const data = await getStoreAnalyticsSummary(parseRangeQuery(req));

  res.status(200).json({
    success: true,
    data,
    message: 'Analytics summary fetched successfully',
  });
});

/**
 * GET /api/analytics/sales-over-time?storeId=&from=&to=
 */
export const getAnalyticsSalesOverTime = asyncErrorHandler(async (req: Request, res: Response) => {
  const data = await getStoreSalesOverTime(parseRangeQuery(req));

  res.status(200).json({
    success: true,
    data,
    message: 'Sales over time fetched successfully',
  });
});

/**
 * GET /api/analytics/sales-by-product?storeId=&from=&to=&limit=
 */
export const getAnalyticsSalesByProduct = asyncErrorHandler(async (req: Request, res: Response) => {
  const range = parseRangeQuery(req);
  const limitRaw = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined;
  const limit = Number.isFinite(limitRaw) ? limitRaw : undefined;
  const data = await getStoreSalesByProduct({ ...range, limit });

  res.status(200).json({
    success: true,
    data,
    message: 'Sales by product fetched successfully',
  });
});

/**
 * GET /api/analytics/aov-over-time?storeId=&from=&to=
 */
export const getAnalyticsAovOverTime = asyncErrorHandler(async (req: Request, res: Response) => {
  const data = await getStoreAovOverTime(parseRangeQuery(req));

  res.status(200).json({
    success: true,
    data,
    message: 'Average order value over time fetched successfully',
  });
});

/**
 * GET /api/analytics/insights?storeId=&from=&to=
 */
export const getAnalyticsInsights = asyncErrorHandler(async (req: Request, res: Response) => {
  const data = await getStoreAnalyticsInsights(parseRangeQuery(req));

  res.status(200).json({
    success: true,
    data,
    message: 'Analytics insights fetched successfully',
  });
});

/**
 * GET /api/analytics/customers?storeId=&from=&to=
 */
export const getAnalyticsCustomers = asyncErrorHandler(async (req: Request, res: Response) => {
  const data = await getStoreCustomerAnalytics(parseRangeQuery(req));

  res.status(200).json({
    success: true,
    data,
    message: 'Customer analytics fetched successfully',
  });
});

/**
 * GET /api/analytics/content?storeId=&from=&to=
 */
export const getAnalyticsContent = asyncErrorHandler(async (req: Request, res: Response) => {
  const data = await getStoreContentAnalytics(parseRangeQuery(req));

  res.status(200).json({
    success: true,
    data,
    message: 'Content analytics fetched successfully',
  });
});

/**
 * GET /api/analytics/products?storeId=&from=&to=
 */
export const getAnalyticsProducts = asyncErrorHandler(async (req: Request, res: Response) => {
  const data = await getStoreProductAnalytics(parseRangeQuery(req));

  res.status(200).json({
    success: true,
    data,
    message: 'Product analytics fetched successfully',
  });
});

/**
 * GET /api/analytics/inventory?storeId=&from=&to=
 */
export const getAnalyticsInventory = asyncErrorHandler(async (req: Request, res: Response) => {
  const data = await getStoreInventoryAnalytics(parseRangeQuery(req));

  res.status(200).json({
    success: true,
    data,
    message: 'Inventory analytics fetched successfully',
  });
});

