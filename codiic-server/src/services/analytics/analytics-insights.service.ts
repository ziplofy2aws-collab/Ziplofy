import mongoose, { Types } from 'mongoose';
import { Country, Customer, CustomerAddress, Order, OrderItem, Product, ProductVariant } from '../../models';
import { InventoryLevelModel } from '../../models/inventory-level/inventory-level.model';
import { CustomError } from '../../utils/error.utils';
import {
  assertValidAnalyticsRange,
  bucketKeyFormat,
  buildEmptyBuckets,
  resolveAnalyticsBucket,
  type AnalyticsRangeQuery,
} from './analytics-summary.service';

const DEFAULT_TIMEZONE = process.env.ANALYTICS_TIMEZONE || 'Asia/Kolkata';
const UNFULFILLED_STATUSES = ['pending', 'paid'] as const;
const LOW_STOCK_THRESHOLD = 5;
const PAYMENT_LABELS: Record<string, string> = {
  credit_card: 'Credit card',
  paypal: 'PayPal',
  cod: 'Cash on delivery',
  bank_transfer: 'Bank transfer',
  upi_id: 'UPI',
  other: 'Other',
};

export type AnalyticsSalesBreakdown = {
  grossSales: number;
  discounts: number;
  salesReversals: number;
  netSales: number;
  shippingCharges: number;
  returnFees: number;
  taxes: number;
  totalSales: number;
};

export type AnalyticsRateStat = {
  rate: number;
  numerator: number;
  denominator: number;
};

export type AnalyticsOrderHealth = {
  unpaid: number;
  unpaidAmount: number;
  unfulfilled: number;
  unfulfilledAmount: number;
};

export type AnalyticsSparklineSeries = {
  grossSales: number[];
  orders: number[];
  ordersFulfilled: number[];
  returningRate: number[];
};

export type AnalyticsLocationSalesRow = {
  name: string;
  path: string;
  sales: number;
  orders: number;
};

export type AnalyticsPaymentMethodRow = {
  key: string;
  name: string;
  sales: number;
  orders: number;
};

export type AnalyticsSellThroughRow = {
  productId: string;
  title: string;
  unitsSold: number;
  onHand: number;
  rate: number;
};

export type AnalyticsTopCustomerRow = {
  customerId: string;
  name: string;
  email: string;
  sales: number;
  orders: number;
};

export type AnalyticsInventoryRiskRow = {
  variantId: string;
  title: string;
  sku: string;
  available: number;
  status: 'sold_out' | 'low';
};

export type AnalyticsRecentOrderRow = {
  orderId: string;
  displayOrderId: string;
  customerName: string;
  total: number;
  status: string;
  paymentStatus: string;
  orderDate: string;
};

export type AnalyticsInsights = {
  salesBreakdown: AnalyticsSalesBreakdown;
  returningCustomerRate: AnalyticsRateStat;
  repeatPurchaseRate: AnalyticsRateStat;
  orderHealth: AnalyticsOrderHealth;
  sparkline: AnalyticsSparklineSeries;
  salesByLocation: AnalyticsLocationSalesRow[];
  salesByPaymentMethod: AnalyticsPaymentMethodRow[];
  sellThrough: AnalyticsSellThroughRow[];
  topCustomers: AnalyticsTopCustomerRow[];
  inventoryRisk: AnalyticsInventoryRiskRow[];
  recentOrders: AnalyticsRecentOrderRow[];
};

function assertStoreId(storeId: string): Types.ObjectId {
  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }
  return new Types.ObjectId(storeId);
}

function roundMoney(value: number): number {
  return Math.round((value || 0) * 100) / 100;
}

const EMPTY_INSIGHTS: AnalyticsInsights = {
  salesBreakdown: {
    grossSales: 0,
    discounts: 0,
    salesReversals: 0,
    netSales: 0,
    shippingCharges: 0,
    returnFees: 0,
    taxes: 0,
    totalSales: 0,
  },
  returningCustomerRate: { rate: 0, numerator: 0, denominator: 0 },
  repeatPurchaseRate: { rate: 0, numerator: 0, denominator: 0 },
  orderHealth: { unpaid: 0, unpaidAmount: 0, unfulfilled: 0, unfulfilledAmount: 0 },
  sparkline: { grossSales: [], orders: [], ordersFulfilled: [], returningRate: [] },
  salesByLocation: [],
  salesByPaymentMethod: [],
  sellThrough: [],
  topCustomers: [],
  inventoryRisk: [],
  recentOrders: [],
};

export async function getStoreAnalyticsInsights(
  query: AnalyticsRangeQuery
): Promise<AnalyticsInsights> {
  const { storeId, from, to } = query;
  const storeObjectId = assertStoreId(storeId);
  assertValidAnalyticsRange(from, to);

  const timezone = query.timezone || DEFAULT_TIMEZONE;
  const bucket = resolveAnalyticsBucket(from, to);
  const activeMatch = {
    storeId: storeObjectId,
    status: { $ne: 'cancelled' },
    orderDate: { $gte: from, $lte: to },
  };

  const [
    breakdownRow,
    returningIds,
    rangeCustomerIds,
    healthRows,
    sparkRows,
    customerBucketRows,
    locationRows,
    paymentRows,
    sellThroughSold,
    inventoryOnHand,
    topCustomerRows,
    riskLevels,
    recentOrderDocs,
  ] = await Promise.all([
    Order.aggregate<{
      grossSales: number;
      salesReversals: number;
      shippingCharges: number;
      taxes: number;
      totalSales: number;
    }>([
      { $match: activeMatch },
      {
        $group: {
          _id: null,
          grossSales: { $sum: '$subtotal' },
          salesReversals: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'refunded'] }, '$subtotal', 0] },
          },
          shippingCharges: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'refunded'] }, 0, '$shippingCost'] },
          },
          taxes: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'refunded'] }, 0, '$tax'] },
          },
          totalSales: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'refunded'] }, 0, '$total'] },
          },
        },
      },
    ]),
    Order.distinct('customerId', {
      storeId: storeObjectId,
      status: { $ne: 'cancelled' },
      orderDate: { $lt: from },
    }),
    Order.distinct('customerId', activeMatch),
    Order.aggregate<{ unpaid: number; unpaidAmount: number; unfulfilled: number; unfulfilledAmount: number }>([
      { $match: activeMatch },
      {
        $group: {
          _id: null,
          unpaid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, 1, 0] } },
          unpaidAmount: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, '$total', 0] } },
          unfulfilled: {
            $sum: { $cond: [{ $in: ['$status', [...UNFULFILLED_STATUSES]] }, 1, 0] },
          },
          unfulfilledAmount: {
            $sum: { $cond: [{ $in: ['$status', [...UNFULFILLED_STATUSES]] }, '$total', 0] },
          },
        },
      },
    ]),
    Order.aggregate<{ _id: string; sales: number; orders: number; ordersFulfilled: number }>([
      { $match: activeMatch },
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
          ordersFulfilled: {
            $sum: { $cond: [{ $in: ['$status', ['shipped', 'delivered']] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate<{ _id: { bucket: string; customerId: Types.ObjectId } }>([
      { $match: activeMatch },
      {
        $group: {
          _id: {
            bucket: {
              $dateToString: {
                format: bucketKeyFormat(bucket),
                date: '$orderDate',
                timezone,
              },
            },
            customerId: '$customerId',
          },
        },
      },
    ]),
    Order.aggregate<{ country: string; state: string; sales: number; orders: number }>([
      { $match: activeMatch },
      {
        $lookup: {
          from: CustomerAddress.collection.name,
          localField: 'shippingAddressId',
          foreignField: '_id',
          as: 'address',
        },
      },
      { $unwind: { path: '$address', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: Country.collection.name,
          localField: 'address.countryId',
          foreignField: '_id',
          as: 'country',
        },
      },
      { $unwind: { path: '$country', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            country: { $ifNull: ['$country.name', 'Unknown'] },
            state: { $ifNull: ['$address.state', ''] },
          },
          sales: { $sum: '$subtotal' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 8 },
      {
        $project: {
          _id: 0,
          country: '$_id.country',
          state: '$_id.state',
          sales: 1,
          orders: 1,
        },
      },
    ]),
    Order.aggregate<{ _id: string | null; sales: number; orders: number }>([
      { $match: activeMatch },
      {
        $group: {
          _id: { $ifNull: ['$paymentMethod', 'unspecified'] },
          sales: { $sum: '$subtotal' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { sales: -1 } },
    ]),
    Order.aggregate<{
      productId: Types.ObjectId;
      title: string;
      unitsSold: number;
      variantIds: Types.ObjectId[];
    }>([
      { $match: activeMatch },
      {
        $lookup: {
          from: OrderItem.collection.name,
          localField: '_id',
          foreignField: 'orderId',
          as: 'items',
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: ProductVariant.collection.name,
          localField: 'items.productVariantId',
          foreignField: '_id',
          as: 'variant',
        },
      },
      { $unwind: { path: '$variant', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: Product.collection.name,
          localField: 'variant.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$product._id', '$variant.productId'] },
          title: { $first: { $ifNull: ['$product.title', '$variant.sku', 'Unknown product'] } },
          unitsSold: { $sum: '$items.quantity' },
          variantIds: { $addToSet: '$items.productVariantId' },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 12 },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          title: 1,
          unitsSold: 1,
          variantIds: 1,
        },
      },
    ]),
    InventoryLevelModel.aggregate<{ variantId: Types.ObjectId; onHand: number; available: number }>([
      {
        $group: {
          _id: '$variantId',
          onHand: { $sum: '$onHand' },
          available: { $sum: '$available' },
        },
      },
      {
        $project: {
          _id: 0,
          variantId: '$_id',
          onHand: 1,
          available: 1,
        },
      },
    ]),
    Order.aggregate<{
      customerId: Types.ObjectId;
      name: string;
      email: string;
      sales: number;
      orders: number;
    }>([
      { $match: activeMatch },
      {
        $group: {
          _id: '$customerId',
          sales: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: Customer.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          customerId: '$_id',
          name: {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ['$customer.firstName', ''] },
                  ' ',
                  { $ifNull: ['$customer.lastName', ''] },
                ],
              },
            },
          },
          email: { $ifNull: ['$customer.email', ''] },
          sales: 1,
          orders: 1,
        },
      },
    ]),
    InventoryLevelModel.aggregate<{
      variantId: Types.ObjectId;
      sku: string;
      title: string;
      available: number;
    }>([
      {
        $group: {
          _id: '$variantId',
          available: { $sum: '$available' },
        },
      },
      { $match: { available: { $lte: LOW_STOCK_THRESHOLD } } },
      {
        $lookup: {
          from: ProductVariant.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'variant',
        },
      },
      { $unwind: { path: '$variant', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: Product.collection.name,
          localField: 'variant.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $match: { 'product.storeId': storeObjectId } },
      {
        $project: {
          _id: 0,
          variantId: '$_id',
          sku: { $ifNull: ['$variant.sku', ''] },
          title: { $ifNull: ['$product.title', '$variant.sku', 'Unknown product'] },
          available: 1,
        },
      },
      { $sort: { available: 1, title: 1 } },
      { $limit: 10 },
    ]),
    Order.find(activeMatch)
      .sort({ orderDate: -1 })
      .limit(8)
      .select('_id displayOrderId customerId total status paymentStatus orderDate')
      .populate({ path: 'customerId', select: 'firstName lastName' })
      .lean(),
  ]);

  const rangeIds = (rangeCustomerIds as Types.ObjectId[]).map((id) => new Types.ObjectId(String(id)));
  const lifetimeByCustomer =
    rangeIds.length === 0
      ? []
      : await Order.aggregate<{ _id: Types.ObjectId; orders: number }>([
          {
            $match: {
              storeId: storeObjectId,
              status: { $ne: 'cancelled' },
              customerId: { $in: rangeIds },
            },
          },
          { $group: { _id: '$customerId', orders: { $sum: 1 } } },
        ]);

  const returningSet = new Set((returningIds as Types.ObjectId[]).map((id) => String(id)));
  const totalCustomers = rangeIds.length;
  const returningCustomers = rangeIds.filter((id) => returningSet.has(String(id))).length;
  const repeatCustomers = lifetimeByCustomer.filter((row) => (row.orders || 0) >= 2).length;

  const grossSales = roundMoney(breakdownRow[0]?.grossSales ?? 0);
  const salesReversals = roundMoney(breakdownRow[0]?.salesReversals ?? 0);
  const shippingCharges = roundMoney(breakdownRow[0]?.shippingCharges ?? 0);
  const taxes = roundMoney(breakdownRow[0]?.taxes ?? 0);
  const discounts = 0;
  const returnFees = 0;
  const netSales = roundMoney(Math.max(0, grossSales - discounts - salesReversals));
  const totalSales = roundMoney(
    breakdownRow[0]?.totalSales ?? netSales + shippingCharges + taxes - returnFees
  );

  const emptyBuckets = buildEmptyBuckets(from, to, bucket, timezone);
  const sparkByKey = new Map(sparkRows.map((row) => [row._id, row]));
  const returningByBucket = new Map<string, { returning: number; total: number }>();
  for (const row of customerBucketRows) {
    const key = row._id.bucket;
    const current = returningByBucket.get(key) ?? { returning: 0, total: 0 };
    current.total += 1;
    if (returningSet.has(String(row._id.customerId))) current.returning += 1;
    returningByBucket.set(key, current);
  }

  const sparkline: AnalyticsSparklineSeries = {
    grossSales: emptyBuckets.map(({ key }) => sparkByKey.get(key)?.sales ?? 0),
    orders: emptyBuckets.map(({ key }) => sparkByKey.get(key)?.orders ?? 0),
    ordersFulfilled: emptyBuckets.map(({ key }) => sparkByKey.get(key)?.ordersFulfilled ?? 0),
    returningRate: emptyBuckets.map(({ key }) => {
      const stats = returningByBucket.get(key);
      if (!stats || stats.total === 0) return 0;
      return stats.returning / stats.total;
    }),
  };

  const onHandByVariant = new Map(
    inventoryOnHand.map((row) => [String(row.variantId), row.onHand || 0])
  );

  const sellThrough: AnalyticsSellThroughRow[] = sellThroughSold
    .filter((row) => row.productId)
    .map((row) => {
      const variantIds = Array.isArray(row.variantIds) ? row.variantIds : [];
      const onHand = variantIds.reduce((sum, id) => sum + (onHandByVariant.get(String(id)) || 0), 0);
      const unitsSold = row.unitsSold || 0;
      const denom = unitsSold + onHand;
      return {
        productId: String(row.productId),
        title: row.title || 'Unknown product',
        unitsSold,
        onHand,
        rate: denom > 0 ? unitsSold / denom : 0,
      };
    })
    .sort((a, b) => b.rate - a.rate || b.unitsSold - a.unitsSold)
    .slice(0, 8);

  const recentOrders: AnalyticsRecentOrderRow[] = (recentOrderDocs as Array<Record<string, unknown>>).map(
    (doc) => {
      const customer = doc.customerId as
        | { firstName?: string; lastName?: string }
        | Types.ObjectId
        | string
        | null;
      const customerName =
        customer && typeof customer === 'object' && 'firstName' in customer
          ? [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim()
          : 'Customer';
      return {
        orderId: String(doc._id),
        displayOrderId: String(doc.displayOrderId || String(doc._id).slice(-4).toUpperCase()),
        customerName: customerName || 'Customer',
        total: roundMoney(Number(doc.total) || 0),
        status: String(doc.status || 'pending'),
        paymentStatus: String(doc.paymentStatus || 'unpaid'),
        orderDate: new Date(String(doc.orderDate)).toISOString(),
      };
    }
  );

  return {
    salesBreakdown: {
      grossSales,
      discounts,
      salesReversals,
      netSales,
      shippingCharges,
      returnFees,
      taxes,
      totalSales,
    },
    returningCustomerRate: {
      rate: totalCustomers > 0 ? returningCustomers / totalCustomers : 0,
      numerator: returningCustomers,
      denominator: totalCustomers,
    },
    repeatPurchaseRate: {
      rate: totalCustomers > 0 ? repeatCustomers / totalCustomers : 0,
      numerator: repeatCustomers,
      denominator: totalCustomers,
    },
    orderHealth: {
      unpaid: healthRows[0]?.unpaid ?? 0,
      unpaidAmount: roundMoney(healthRows[0]?.unpaidAmount ?? 0),
      unfulfilled: healthRows[0]?.unfulfilled ?? 0,
      unfulfilledAmount: roundMoney(healthRows[0]?.unfulfilledAmount ?? 0),
    },
    sparkline,
    salesByLocation: locationRows.map((row) => ({
      name: row.state || row.country || 'Unknown',
      path: [row.country, row.state].filter(Boolean).join(' · '),
      sales: roundMoney(row.sales),
      orders: row.orders,
    })),
    salesByPaymentMethod: paymentRows.map((row) => {
      const key = String(row._id || 'unspecified');
      return {
        key,
        name: PAYMENT_LABELS[key] || (key === 'unspecified' ? 'Unspecified' : key),
        sales: roundMoney(row.sales),
        orders: row.orders,
      };
    }),
    sellThrough,
    topCustomers: topCustomerRows.map((row) => ({
      customerId: String(row.customerId),
      name: row.name?.trim() || 'Customer',
      email: row.email || '',
      sales: roundMoney(row.sales),
      orders: row.orders,
    })),
    inventoryRisk: riskLevels.map((row) => ({
      variantId: String(row.variantId),
      title: row.title || row.sku || 'Unknown product',
      sku: row.sku || '',
      available: row.available || 0,
      status: (row.available || 0) <= 0 ? 'sold_out' : 'low',
    })),
    recentOrders,
  };
}

export function emptyAnalyticsInsights(): AnalyticsInsights {
  return EMPTY_INSIGHTS;
}
