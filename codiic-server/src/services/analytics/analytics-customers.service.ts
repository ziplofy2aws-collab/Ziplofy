import mongoose, { Types } from 'mongoose';
import {
  Country,
  Customer,
  CustomerAddress,
  CustomerSegment,
  CustomerSegmentEntry,
  Order,
} from '../../models';
import { CustomerTags } from '../../models/customer-tags/customer-tags.model';
import { CustomError } from '../../utils/error.utils';
import {
  assertValidAnalyticsRange,
  type AnalyticsRangeQuery,
} from './analytics-summary.service';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  mr: 'Marathi',
  bn: 'Bengali',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  pa: 'Punjabi',
  ur: 'Urdu',
};

const LTV_BUCKETS = [
  { key: '0-999', label: '₹0–999', min: 0, max: 999.999 },
  { key: '1k-5k', label: '₹1k–4.9k', min: 1000, max: 4999.999 },
  { key: '5k-10k', label: '₹5k–9.9k', min: 5000, max: 9999.999 },
  { key: '10k-25k', label: '₹10k–24.9k', min: 10000, max: 24999.999 },
  { key: '25k-50k', label: '₹25k–49.9k', min: 25000, max: 49999.999 },
  { key: '50k+', label: '₹50k+', min: 50000, max: Number.POSITIVE_INFINITY },
] as const;

const RECENCY_BUCKETS = [
  { key: '0-7', label: 'Last 7 days', max: 7 },
  { key: '8-30', label: '8–30 days', max: 30 },
  { key: '31-90', label: '31–90 days', max: 90 },
  { key: '91-180', label: '91–180 days', max: 180 },
  { key: '180+', label: '180+ days', max: Number.POSITIVE_INFINITY },
] as const;

export type AnalyticsCountRate = {
  count: number;
  total: number;
  rate: number;
};

export type AnalyticsDayStat = {
  averageDays: number;
  medianDays: number;
  sample: number;
};

export type AnalyticsNamedCount = {
  key: string;
  name: string;
  value: number;
};

export type AnalyticsNamedMoney = {
  key: string;
  name: string;
  sales: number;
  orders: number;
  aov: number;
};

export type AnalyticsLtvBucket = {
  key: string;
  label: string;
  customers: number;
  sales: number;
};

export type AnalyticsSegmentRow = {
  segmentId: string;
  name: string;
  customers: number;
  gmv: number;
  orders: number;
};

export type AnalyticsCustomerInsights = {
  newCustomers: number;
  purchasedVsNeverBought: {
    purchased: number;
    neverBought: number;
    signups: number;
    storePurchased: number;
    storeNeverBought: number;
    storeCustomers: number;
  };
  newVsReturningBuyers: {
    newBuyers: number;
    returningBuyers: number;
    totalBuyers: number;
  };
  ltvDistribution: AnalyticsLtvBucket[];
  ordersPerCustomer: {
    average: number;
    median: number;
    buyers: number;
    allCustomersAverage: number;
  };
  timeToFirstPurchase: AnalyticsDayStat;
  recency: AnalyticsDayStat & { buckets: AnalyticsNamedCount[] };
  purchaseFrequency: AnalyticsDayStat;
  emailOptIn: AnalyticsCountRate;
  smsOptIn: AnalyticsCountRate;
  customersByTag: AnalyticsNamedCount[];
  segments: AnalyticsSegmentRow[];
  languageMix: AnalyticsNamedCount[];
  aovByCountry: AnalyticsNamedMoney[];
  aovByState: AnalyticsNamedMoney[];
  aovByCity: AnalyticsNamedMoney[];
  salesByPin: AnalyticsNamedMoney[];
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

function roundDays(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value * 10) / 10;
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

function languageLabel(code: string): string {
  const key = (code || 'en').trim().toLowerCase() || 'en';
  return LANGUAGE_LABELS[key] || code || 'Unknown';
}

export function emptyCustomerInsights(): AnalyticsCustomerInsights {
  return {
    newCustomers: 0,
    purchasedVsNeverBought: {
      purchased: 0,
      neverBought: 0,
      signups: 0,
      storePurchased: 0,
      storeNeverBought: 0,
      storeCustomers: 0,
    },
    newVsReturningBuyers: { newBuyers: 0, returningBuyers: 0, totalBuyers: 0 },
    ltvDistribution: LTV_BUCKETS.map((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      customers: 0,
      sales: 0,
    })),
    ordersPerCustomer: { average: 0, median: 0, buyers: 0, allCustomersAverage: 0 },
    timeToFirstPurchase: { averageDays: 0, medianDays: 0, sample: 0 },
    recency: {
      averageDays: 0,
      medianDays: 0,
      sample: 0,
      buckets: RECENCY_BUCKETS.map((bucket) => ({ key: bucket.key, name: bucket.label, value: 0 })),
    },
    purchaseFrequency: { averageDays: 0, medianDays: 0, sample: 0 },
    emailOptIn: { count: 0, total: 0, rate: 0 },
    smsOptIn: { count: 0, total: 0, rate: 0 },
    customersByTag: [],
    segments: [],
    languageMix: [],
    aovByCountry: [],
    aovByState: [],
    aovByCity: [],
    salesByPin: [],
  };
}

type BuyerRow = {
  _id: Types.ObjectId;
  orders: number;
  sales: number;
  firstOrder: Date;
  lastOrder: Date;
  rangeOrders: number;
  rangeSales: number;
};

export async function getStoreCustomerAnalytics(
  query: AnalyticsRangeQuery
): Promise<AnalyticsCustomerInsights> {
  const storeObjectId = assertStoreId(query.storeId);
  assertValidAnalyticsRange(query.from, query.to);
  const { from, to } = query;

  const [
    customers,
    buyerRows,
    locationRows,
    tags,
    segments,
  ] = await Promise.all([
    Customer.find({ storeId: storeObjectId })
      .select('_id createdAt agreedToMarketingEmails agreedToSmsMarketing language tagIds')
      .lean(),
    Order.aggregate<BuyerRow>([
      { $match: { storeId: storeObjectId, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$customerId',
          orders: { $sum: 1 },
          sales: { $sum: '$total' },
          firstOrder: { $min: '$orderDate' },
          lastOrder: { $max: '$orderDate' },
          rangeOrders: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$orderDate', from] }, { $lte: ['$orderDate', to] }] },
                1,
                0,
              ],
            },
          },
          rangeSales: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$orderDate', from] }, { $lte: ['$orderDate', to] }] },
                '$total',
                0,
              ],
            },
          },
        },
      },
    ]),
    Order.aggregate<{
      country: string;
      state: string;
      city: string;
      pinCode: string;
      sales: number;
      orders: number;
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
            state: { $ifNull: ['$address.state', 'Unknown'] },
            city: { $ifNull: ['$address.city', 'Unknown'] },
            pinCode: { $ifNull: ['$address.pinCode', ''] },
          },
          sales: { $sum: '$subtotal' },
          orders: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          country: '$_id.country',
          state: '$_id.state',
          city: '$_id.city',
          pinCode: '$_id.pinCode',
          sales: 1,
          orders: 1,
        },
      },
    ]),
    CustomerTags.find({ storeId: storeObjectId }).select('_id name').lean(),
    CustomerSegment.find({ storeId: storeObjectId }).select('_id name').lean(),
  ]);

  const buyerById = new Map(buyerRows.map((row) => [String(row._id), row]));
  const customerById = new Map(customers.map((customer) => [String(customer._id), customer]));
  const signups = customers.filter((customer) => {
    const created = new Date(customer.createdAt).getTime();
    return created >= from.getTime() && created <= to.getTime();
  });
  const signupPurchased = signups.filter((customer) => buyerById.has(String(customer._id))).length;

  const rangeBuyers = buyerRows.filter((row) => (row.rangeOrders || 0) > 0);
  const newBuyers = rangeBuyers.filter((row) => new Date(row.firstOrder).getTime() >= from.getTime()).length;
  const returningBuyers = rangeBuyers.length - newBuyers;

  const ltvDistribution = LTV_BUCKETS.map((bucket) => {
    const rows = buyerRows.filter((row) => row.sales >= bucket.min && row.sales <= bucket.max);
    return {
      key: bucket.key,
      label: bucket.label,
      customers: rows.length,
      sales: roundMoney(rows.reduce((sum, row) => sum + (row.sales || 0), 0)),
    };
  });

  const buyerOrderCounts = buyerRows.map((row) => row.orders || 0);
  const firstPurchaseDays = buyerRows
    .map((row) => {
      const customer = customerById.get(String(row._id));
      if (!customer?.createdAt || !row.firstOrder) return null;
      const days = (new Date(row.firstOrder).getTime() - new Date(customer.createdAt).getTime()) / MS_PER_DAY;
      return Number.isFinite(days) ? Math.max(0, days) : null;
    })
    .filter((n): n is number => n != null);

  const recencyDays = buyerRows.map((row) =>
    Math.max(0, (to.getTime() - new Date(row.lastOrder).getTime()) / MS_PER_DAY)
  );
  const recencyBuckets = RECENCY_BUCKETS.map((bucket, index) => {
    const prevMax = index === 0 ? -1 : RECENCY_BUCKETS[index - 1].max;
    const value = recencyDays.filter((days) => days > prevMax && days <= bucket.max).length;
    return { key: bucket.key, name: bucket.label, value };
  });

  const frequencyDays = buyerRows
    .filter((row) => (row.orders || 0) >= 2 && row.firstOrder && row.lastOrder)
    .map((row) => {
      const span = new Date(row.lastOrder).getTime() - new Date(row.firstOrder).getTime();
      return Math.max(0, span / MS_PER_DAY / (row.orders - 1));
    });

  const emailOptedIn = customers.filter((c) => Boolean(c.agreedToMarketingEmails)).length;
  const smsOptedIn = customers.filter((c) => Boolean(c.agreedToSmsMarketing)).length;

  const tagNameById = new Map(tags.map((tag) => [String(tag._id), tag.name]));
  const tagCounts = new Map<string, number>();
  for (const customer of customers) {
    for (const tagId of customer.tagIds || []) {
      const key = String(tagId);
      tagCounts.set(key, (tagCounts.get(key) || 0) + 1);
    }
  }
  const customersByTag: AnalyticsNamedCount[] = [...tagCounts.entries()]
    .map(([key, value]) => ({
      key,
      name: tagNameById.get(key) || 'Untitled tag',
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const segmentIds = segments.map((segment) => segment._id);
  const segmentEntries =
    segmentIds.length === 0
      ? []
      : await CustomerSegmentEntry.find({ segmentId: { $in: segmentIds } })
          .select('segmentId customerId')
          .lean();
  const customersBySegment = new Map<string, string[]>();
  for (const entry of segmentEntries) {
    const key = String(entry.segmentId);
    const list = customersBySegment.get(key) ?? [];
    list.push(String(entry.customerId));
    customersBySegment.set(key, list);
  }
  const segmentsOut: AnalyticsSegmentRow[] = segments
    .map((segment) => {
      const memberIds = customersBySegment.get(String(segment._id)) ?? [];
      let gmv = 0;
      let orders = 0;
      for (const id of memberIds) {
        const buyer = buyerById.get(id);
        if (!buyer) continue;
        gmv += buyer.rangeSales || 0;
        orders += buyer.rangeOrders || 0;
      }
      return {
        segmentId: String(segment._id),
        name: segment.name,
        customers: memberIds.length,
        gmv: roundMoney(gmv),
        orders,
      };
    })
    .sort((a, b) => b.gmv - a.gmv || b.customers - a.customers);

  const languageCounts = new Map<string, number>();
  for (const customer of customers) {
    const key = (customer.language || 'en').trim().toLowerCase() || 'en';
    languageCounts.set(key, (languageCounts.get(key) || 0) + 1);
  }
  const languageMix: AnalyticsNamedCount[] = [...languageCounts.entries()]
    .map(([key, value]) => ({ key, name: languageLabel(key), value }))
    .sort((a, b) => b.value - a.value);

  const rollupLocation = (
    rows: typeof locationRows,
    pick: (row: (typeof locationRows)[number]) => string,
    limit = 8
  ): AnalyticsNamedMoney[] => {
    const grouped = new Map<string, { sales: number; orders: number }>();
    for (const row of rows) {
      const name = (pick(row) || 'Unknown').trim() || 'Unknown';
      const current = grouped.get(name) ?? { sales: 0, orders: 0 };
      current.sales += row.sales || 0;
      current.orders += row.orders || 0;
      grouped.set(name, current);
    }
    return [...grouped.entries()]
      .map(([name, stats]) => ({
        key: name,
        name,
        sales: roundMoney(stats.sales),
        orders: stats.orders,
        aov: stats.orders > 0 ? roundMoney(stats.sales / stats.orders) : 0,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);
  };

  const salesByPin = locationRows
    .filter((row) => (row.pinCode || '').trim())
    .reduce<Map<string, { sales: number; orders: number }>>((map, row) => {
      const pin = row.pinCode.trim();
      const current = map.get(pin) ?? { sales: 0, orders: 0 };
      current.sales += row.sales || 0;
      current.orders += row.orders || 0;
      map.set(pin, current);
      return map;
    }, new Map());

  return {
    newCustomers: signups.length,
    purchasedVsNeverBought: {
      purchased: signupPurchased,
      neverBought: Math.max(0, signups.length - signupPurchased),
      signups: signups.length,
      storePurchased: buyerRows.length,
      storeNeverBought: Math.max(0, customers.length - buyerRows.length),
      storeCustomers: customers.length,
    },
    newVsReturningBuyers: {
      newBuyers,
      returningBuyers,
      totalBuyers: rangeBuyers.length,
    },
    ltvDistribution,
    ordersPerCustomer: {
      average: roundDays(average(buyerOrderCounts)),
      median: roundDays(median(buyerOrderCounts)),
      buyers: buyerRows.length,
      allCustomersAverage:
        customers.length > 0 ? roundDays(buyerRows.reduce((sum, row) => sum + row.orders, 0) / customers.length) : 0,
    },
    timeToFirstPurchase: {
      averageDays: roundDays(average(firstPurchaseDays)),
      medianDays: roundDays(median(firstPurchaseDays)),
      sample: firstPurchaseDays.length,
    },
    recency: {
      averageDays: roundDays(average(recencyDays)),
      medianDays: roundDays(median(recencyDays)),
      sample: recencyDays.length,
      buckets: recencyBuckets,
    },
    purchaseFrequency: {
      averageDays: roundDays(average(frequencyDays)),
      medianDays: roundDays(median(frequencyDays)),
      sample: frequencyDays.length,
    },
    emailOptIn: {
      count: emailOptedIn,
      total: customers.length,
      rate: customers.length > 0 ? emailOptedIn / customers.length : 0,
    },
    smsOptIn: {
      count: smsOptedIn,
      total: customers.length,
      rate: customers.length > 0 ? smsOptedIn / customers.length : 0,
    },
    customersByTag,
    segments: segmentsOut,
    languageMix,
    aovByCountry: rollupLocation(locationRows, (row) => row.country),
    aovByState: rollupLocation(locationRows, (row) => row.state),
    aovByCity: rollupLocation(locationRows, (row) => row.city),
    salesByPin: [...salesByPin.entries()]
      .map(([name, stats]) => ({
        key: name,
        name,
        sales: roundMoney(stats.sales),
        orders: stats.orders,
        aov: stats.orders > 0 ? roundMoney(stats.sales / stats.orders) : 0,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10),
  };
}
