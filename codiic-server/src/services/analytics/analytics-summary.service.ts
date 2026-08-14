import mongoose, { Types } from 'mongoose';
import { Order } from '../../models';
import { CustomError } from '../../utils/error.utils';

const MAX_RANGE_MS = 366 * 24 * 60 * 60 * 1000;
const FULFILLED_STATUSES = ['shipped', 'delivered'] as const;
const DEFAULT_TIMEZONE = process.env.ANALYTICS_TIMEZONE || 'Asia/Kolkata';

export type AnalyticsSummary = {
  orders: number;
  ordersFulfilled: number;
  grossSales: number;
};

export type AnalyticsBucket = 'hour' | 'day' | 'month';

export type AnalyticsSalesPoint = {
  /** ISO timestamp at bucket start (UTC). */
  t: string;
  /** Display label for the chart axis. */
  label: string;
  sales: number;
};

export type AnalyticsSalesOverTime = {
  totalGrossSales: number;
  bucket: AnalyticsBucket;
  timezone: string;
  points: AnalyticsSalesPoint[];
};

export type AnalyticsRangeQuery = {
  storeId: string;
  from: Date;
  to: Date;
  timezone?: string;
};

export function assertValidAnalyticsRange(from: Date, to: Date): void {
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw new CustomError('Valid from and to dates are required', 400);
  }
  if (from > to) {
    throw new CustomError('"from" must be before or equal to "to"', 400);
  }
  if (to.getTime() - from.getTime() > MAX_RANGE_MS) {
    throw new CustomError('Date range cannot exceed 366 days', 400);
  }
}

export function resolveAnalyticsBucket(from: Date, to: Date): AnalyticsBucket {
  const sameDay =
    from.getFullYear() === to.getFullYear() &&
    from.getMonth() === to.getMonth() &&
    from.getDate() === to.getDate();
  if (sameDay) return 'hour';

  const daySpan = Math.ceil((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
  if (daySpan <= 60) return 'day';
  return 'month';
}

function assertStoreId(storeId: string): Types.ObjectId {
  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }
  return new Types.ObjectId(storeId);
}

/**
 * Store-scoped summary for Analytics cards.
 * Gross sales = sum(subtotal); fulfilled = shipped | delivered; excludes cancelled.
 */
export async function getStoreAnalyticsSummary(
  query: AnalyticsRangeQuery
): Promise<AnalyticsSummary> {
  const { storeId, from, to } = query;
  const storeObjectId = assertStoreId(storeId);
  assertValidAnalyticsRange(from, to);

  const [row] = await Order.aggregate<{
    orders: number;
    ordersFulfilled: number;
    grossSales: number;
  }>([
    {
      $match: {
        storeId: storeObjectId,
        status: { $ne: 'cancelled' },
        orderDate: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: null,
        orders: { $sum: 1 },
        ordersFulfilled: {
          $sum: {
            $cond: [{ $in: ['$status', [...FULFILLED_STATUSES]] }, 1, 0],
          },
        },
        grossSales: { $sum: '$subtotal' },
      },
    },
  ]);

  return {
    orders: row?.orders ?? 0,
    ordersFulfilled: row?.ordersFulfilled ?? 0,
    grossSales: row?.grossSales ?? 0,
  };
}

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
};

function zonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? NaN);

  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
  };
}

/** Approximate an instant for Y-M-D H:00 in a timezone via binary search. */
function zonedDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  timeZone: string
): Date {
  let lo = Date.UTC(year, month - 1, day, hour) - 14 * 60 * 60 * 1000;
  let hi = Date.UTC(year, month - 1, day, hour) + 14 * 60 * 60 * 1000;
  for (let i = 0; i < 40; i += 1) {
    const mid = Math.floor((lo + hi) / 2);
    const p = zonedParts(new Date(mid), timeZone);
    const cmp =
      p.year - year ||
      p.month - month ||
      p.day - day ||
      p.hour - hour;
    if (cmp === 0) return new Date(mid);
    if (cmp < 0) lo = mid + 1;
    else hi = mid - 1;
  }
  return new Date(Date.UTC(year, month - 1, day, hour));
}

function formatBucketLabel(bucket: AnalyticsBucket, instant: Date, timeZone: string): string {
  if (bucket === 'hour') {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      hourCycle: 'h12',
    }).format(instant);
  }
  if (bucket === 'day') {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      month: 'short',
      day: 'numeric',
    }).format(instant);
  }
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'short',
    year: 'numeric',
  }).format(instant);
}

export function bucketKeyFormat(bucket: AnalyticsBucket): string {
  if (bucket === 'hour') return '%Y-%m-%dT%H';
  if (bucket === 'day') return '%Y-%m-%d';
  return '%Y-%m';
}

function partsToBucketKey(bucket: AnalyticsBucket, parts: ZonedParts): string {
  const y = String(parts.year).padStart(4, '0');
  const m = String(parts.month).padStart(2, '0');
  const d = String(parts.day).padStart(2, '0');
  const h = String(parts.hour).padStart(2, '0');
  if (bucket === 'hour') return `${y}-${m}-${d}T${h}`;
  if (bucket === 'day') return `${y}-${m}-${d}`;
  return `${y}-${m}`;
}

export function buildEmptyBuckets(
  from: Date,
  to: Date,
  bucket: AnalyticsBucket,
  timeZone: string
): Array<{ key: string; point: AnalyticsSalesPoint }> {
  const start = zonedParts(from, timeZone);
  const end = zonedParts(to, timeZone);
  const rows: Array<{ key: string; point: AnalyticsSalesPoint }> = [];

  if (bucket === 'hour') {
    for (let hour = 0; hour < 24; hour += 1) {
      const instant = zonedDateTimeToUtc(start.year, start.month, start.day, hour, timeZone);
      const key = partsToBucketKey('hour', {
        year: start.year,
        month: start.month,
        day: start.day,
        hour,
      });
      rows.push({
        key,
        point: {
          t: instant.toISOString(),
          label: formatBucketLabel('hour', instant, timeZone),
          sales: 0,
        },
      });
    }
    return rows;
  }

  if (bucket === 'day') {
    let y = start.year;
    let m = start.month;
    let d = start.day;
    while (
      y < end.year ||
      (y === end.year && m < end.month) ||
      (y === end.year && m === end.month && d <= end.day)
    ) {
      const instant = zonedDateTimeToUtc(y, m, d, 0, timeZone);
      const key = partsToBucketKey('day', { year: y, month: m, day: d, hour: 0 });
      rows.push({
        key,
        point: {
          t: instant.toISOString(),
          label: formatBucketLabel('day', instant, timeZone),
          sales: 0,
        },
      });
      const next = new Date(Date.UTC(y, m - 1, d + 1));
      y = next.getUTCFullYear();
      m = next.getUTCMonth() + 1;
      d = next.getUTCDate();
    }
    return rows;
  }

  let y = start.year;
  let m = start.month;
  while (y < end.year || (y === end.year && m <= end.month)) {
    const instant = zonedDateTimeToUtc(y, m, 1, 0, timeZone);
    const key = partsToBucketKey('month', { year: y, month: m, day: 1, hour: 0 });
    rows.push({
      key,
      point: {
        t: instant.toISOString(),
        label: formatBucketLabel('month', instant, timeZone),
        sales: 0,
      },
    });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return rows;
}

/**
 * Gross sales (subtotal) over time with auto hour/day/month buckets.
 */
export async function getStoreSalesOverTime(
  query: AnalyticsRangeQuery
): Promise<AnalyticsSalesOverTime> {
  const { storeId, from, to } = query;
  const storeObjectId = assertStoreId(storeId);
  assertValidAnalyticsRange(from, to);

  const timezone = query.timezone || DEFAULT_TIMEZONE;
  const bucket = resolveAnalyticsBucket(from, to);

  const rows = await Order.aggregate<{ _id: string; sales: number }>([
    {
      $match: {
        storeId: storeObjectId,
        status: { $ne: 'cancelled' },
        orderDate: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: bucketKeyFormat(bucket),
            date: '$orderDate',
            timezone,
          },
        },
        sales: { $sum: '$subtotal' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const salesByKey = new Map(rows.map((row) => [row._id, row.sales ?? 0]));
  const points = buildEmptyBuckets(from, to, bucket, timezone).map(({ key, point }) => ({
    ...point,
    sales: salesByKey.get(key) ?? 0,
  }));

  const totalGrossSales = points.reduce((sum, p) => sum + p.sales, 0);

  return {
    totalGrossSales,
    bucket,
    timezone,
    points,
  };
}

export type AnalyticsAovPoint = {
  t: string;
  label: string;
  aov: number;
};

export type AnalyticsAovOverTime = {
  averageOrderValue: number;
  orders: number;
  totalGrossSales: number;
  bucket: AnalyticsBucket;
  timezone: string;
  points: AnalyticsAovPoint[];
};

/**
 * Average order value over time: gross sales (subtotal) ÷ order count per bucket.
 */
export async function getStoreAovOverTime(
  query: AnalyticsRangeQuery
): Promise<AnalyticsAovOverTime> {
  const { storeId, from, to } = query;
  const storeObjectId = assertStoreId(storeId);
  assertValidAnalyticsRange(from, to);

  const timezone = query.timezone || DEFAULT_TIMEZONE;
  const bucket = resolveAnalyticsBucket(from, to);

  const rows = await Order.aggregate<{ _id: string; sales: number; orders: number }>([
    {
      $match: {
        storeId: storeObjectId,
        status: { $ne: 'cancelled' },
        orderDate: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: bucketKeyFormat(bucket),
            date: '$orderDate',
            timezone,
          },
        },
        sales: { $sum: '$subtotal' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const byKey = new Map(rows.map((row) => [row._id, row]));
  let totalGrossSales = 0;
  let orders = 0;

  const points = buildEmptyBuckets(from, to, bucket, timezone).map(({ key, point }) => {
    const row = byKey.get(key);
    const sales = row?.sales ?? 0;
    const orderCount = row?.orders ?? 0;
    totalGrossSales += sales;
    orders += orderCount;
    return {
      t: point.t,
      label: point.label,
      aov: orderCount > 0 ? sales / orderCount : 0,
    };
  });

  return {
    averageOrderValue: orders > 0 ? totalGrossSales / orders : 0,
    orders,
    totalGrossSales,
    bucket,
    timezone,
    points,
  };
}

export type AnalyticsProductSalesRow = {
  productId: string;
  title: string;
  imageUrl: string | null;
  sales: number;
  units: number;
};

export type AnalyticsSalesByProduct = {
  totalSales: number;
  products: AnalyticsProductSalesRow[];
};

/**
 * Top products by line-item sales (sum of OrderItem.total) in the date range.
 */
export async function getStoreSalesByProduct(
  query: AnalyticsRangeQuery & { limit?: number }
): Promise<AnalyticsSalesByProduct> {
  const { storeId, from, to } = query;
  const storeObjectId = assertStoreId(storeId);
  assertValidAnalyticsRange(from, to);

  const limit = Math.min(Math.max(query.limit ?? 8, 1), 25);

  const rows = await Order.aggregate<{
    _id: Types.ObjectId;
    title: string;
    imageUrl?: string | null;
    sales: number;
    units: number;
  }>([
    {
      $match: {
        storeId: storeObjectId,
        status: { $ne: 'cancelled' },
        orderDate: { $gte: from, $lte: to },
      },
    },
    {
      $lookup: {
        from: 'orderitems',
        localField: '_id',
        foreignField: 'orderId',
        as: 'items',
      },
    },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'productvariants',
        localField: 'items.productVariantId',
        foreignField: '_id',
        as: 'variant',
      },
    },
    { $unwind: { path: '$variant', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'products',
        localField: 'variant.productId',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: {
          $ifNull: ['$product._id', '$variant.productId', '$items.productVariantId'],
        },
        title: {
          $first: {
            $ifNull: ['$product.title', '$variant.sku', 'Unknown product'],
          },
        },
        imageUrl: {
          $first: {
            $arrayElemAt: [{ $ifNull: ['$product.imageUrls', []] }, 0],
          },
        },
        sales: { $sum: '$items.total' },
        units: { $sum: '$items.quantity' },
      },
    },
    { $sort: { sales: -1 } },
    { $limit: limit },
  ]);

  const products: AnalyticsProductSalesRow[] = rows.map((row) => ({
    productId: String(row._id),
    title: row.title || 'Unknown product',
    imageUrl: row.imageUrl || null,
    sales: row.sales ?? 0,
    units: row.units ?? 0,
  }));

  const totalSales = products.reduce((sum, row) => sum + row.sales, 0);

  return { totalSales, products };
}

