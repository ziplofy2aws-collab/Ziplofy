import mongoose, { Types } from 'mongoose';
import {
  CollectionEntry,
  Collections,
  Order,
  OrderItem,
  Product,
  ProductVariant,
} from '../../models';
import { Category } from '../../models/category/category.model';
import { ProductTags } from '../../models/product-tags/product-tags.model';
import { ProductType } from '../../models/product-type/product-type.model';
import { Vendor } from '../../models/vendor/vendor.model';
import { CustomError } from '../../utils/error.utils';
import {
  assertValidAnalyticsRange,
  type AnalyticsRangeQuery,
} from './analytics-summary.service';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const LIST_LIMIT = 8;

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
  units: number;
};

export type AnalyticsSkuRow = {
  variantId: string;
  sku: string;
  title: string;
  options: string;
  sales: number;
  units: number;
  velocity: number;
};

export type AnalyticsCollectionRow = {
  collectionId: string;
  name: string;
  sales: number;
  units: number;
  orders: number;
  products: number;
};

export type AnalyticsProductInsights = {
  daySpan: number;
  topSkus: AnalyticsSkuRow[];
  topOptions: AnalyticsNamedCount[];
  salesByVendor: AnalyticsNamedMoney[];
  salesByType: AnalyticsNamedMoney[];
  salesByCategory: AnalyticsNamedMoney[];
  salesByTag: AnalyticsNamedMoney[];
  collections: AnalyticsCollectionRow[];
  margin: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    marginRate: number;
    units: number;
    unitsMissingCost: number;
  };
  digitalMix: {
    physicalSales: number;
    physicalUnits: number;
    digitalSales: number;
    digitalUnits: number;
    digitalRate: number;
  };
  catalog: {
    active: number;
    draft: number;
    total: number;
    activeRate: number;
  };
  markdown: {
    catalogOnSale: number;
    catalogTotal: number;
    catalogRate: number;
    soldOnSaleUnits: number;
    soldUnits: number;
    soldOnSaleRate: number;
  };
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

function roundRate(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value * 1000) / 1000;
}

function roundDays(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value * 10) / 10;
}

function daySpanInclusive(from: Date, to: Date): number {
  const span = Math.ceil((to.getTime() - from.getTime()) / MS_PER_DAY);
  return Math.max(1, span);
}

function formatOptionMap(value: unknown): string {
  if (!value || typeof value !== 'object') return '';
  const entries = value instanceof Map ? [...value.entries()] : Object.entries(value as Record<string, unknown>);
  return entries
    .filter(([, optionValue]) => optionValue != null && String(optionValue).trim())
    .map(([key, optionValue]) => `${key}: ${String(optionValue)}`)
    .join(' · ');
}

function moneyRows(
  rows: Array<{ _id?: unknown; name?: string; sales?: number; units?: number; orders?: number }>,
): AnalyticsNamedMoney[] {
  return rows.map((row) => {
    const sales = roundMoney(row.sales || 0);
    const orders = row.orders || 0;
    return {
      key: String(row._id ?? row.name ?? 'unknown'),
      name: row.name?.trim() || 'Unspecified',
      sales,
      orders,
      aov: orders > 0 ? roundMoney(sales / orders) : 0,
      units: row.units || 0,
    };
  });
}

export async function getStoreProductAnalytics(
  query: AnalyticsRangeQuery,
): Promise<AnalyticsProductInsights> {
  const storeObjectId = assertStoreId(query.storeId);
  assertValidAnalyticsRange(query.from, query.to);
  const { from, to } = query;
  const days = daySpanInclusive(from, to);

  const orderItems = OrderItem.collection.name;
  const variants = ProductVariant.collection.name;
  const products = Product.collection.name;
  const vendors = Vendor.collection.name;
  const types = ProductType.collection.name;
  const categories = Category.collection.name;
  const tags = ProductTags.collection.name;
  const entries = CollectionEntry.collection.name;
  const collections = Collections.collection.name;

  const [facetRows, activeCount, draftCount, markdownCatalog] = await Promise.all([
    Order.aggregate<{
      topSkus: Array<{
        _id?: Types.ObjectId | null;
        sku?: string;
        title?: string;
        optionValues?: Record<string, string> | null;
        sales?: number;
        units?: number;
      }>;
      topOptions: Array<{ key?: string; name?: string; value?: number }>;
      byVendor: Array<{ _id?: unknown; name?: string; sales?: number; units?: number; orders?: number }>;
      byType: Array<{ _id?: unknown; name?: string; sales?: number; units?: number; orders?: number }>;
      byCategory: Array<{ _id?: unknown; name?: string; sales?: number; units?: number; orders?: number }>;
      byTag: Array<{ _id?: unknown; name?: string; sales?: number; units?: number; orders?: number }>;
      collections: Array<{
        _id?: unknown;
        name?: string;
        sales?: number;
        units?: number;
        orders?: number;
        products?: number;
      }>;
      margin: Array<{
        revenue?: number;
        cogs?: number;
        units?: number;
        unitsMissingCost?: number;
      }>;
      digitalMix: Array<{ _id?: boolean; sales?: number; units?: number }>;
      markdownSold: Array<{ soldUnits?: number; soldOnSaleUnits?: number }>;
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
          from: orderItems,
          localField: '_id',
          foreignField: 'orderId',
          as: 'items',
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: variants,
          localField: 'items.productVariantId',
          foreignField: '_id',
          as: 'variant',
        },
      },
      { $unwind: { path: '$variant', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: products,
          localField: 'variant.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $facet: {
          topSkus: [
            {
              $group: {
                _id: { $ifNull: ['$variant._id', '$items.productVariantId'] },
                sku: { $first: { $ifNull: ['$variant.sku', '—'] } },
                title: { $first: { $ifNull: ['$product.title', 'Unknown product'] } },
                optionValues: { $first: '$variant.optionValues' },
                sales: { $sum: '$items.total' },
                units: { $sum: '$items.quantity' },
              },
            },
            { $sort: { sales: -1 } },
            { $limit: LIST_LIMIT },
          ],
          topOptions: [
            {
              $project: {
                qty: '$items.quantity',
                pairs: { $objectToArray: { $ifNull: ['$variant.optionValues', {}] } },
              },
            },
            { $unwind: '$pairs' },
            {
              $group: {
                _id: { k: '$pairs.k', v: '$pairs.v' },
                value: { $sum: '$qty' },
              },
            },
            { $sort: { value: -1 } },
            { $limit: LIST_LIMIT },
            {
              $project: {
                _id: 0,
                key: { $concat: [{ $toString: '$_id.k' }, '=', { $toString: '$_id.v' }] },
                name: { $concat: [{ $toString: '$_id.k' }, ': ', { $toString: '$_id.v' }] },
                value: 1,
              },
            },
          ],
          byVendor: [
            {
              $lookup: {
                from: vendors,
                localField: 'product.vendor',
                foreignField: '_id',
                as: 'vendorDoc',
              },
            },
            { $unwind: { path: '$vendorDoc', preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: { $ifNull: ['$vendorDoc._id', 'unspecified'] },
                name: { $first: { $ifNull: ['$vendorDoc.name', 'Unspecified'] } },
                sales: { $sum: '$items.total' },
                units: { $sum: '$items.quantity' },
                orderIds: { $addToSet: '$_id' },
              },
            },
            {
              $project: {
                name: 1,
                sales: 1,
                units: 1,
                orders: { $size: '$orderIds' },
              },
            },
            { $sort: { sales: -1 } },
            { $limit: LIST_LIMIT },
          ],
          byType: [
            {
              $lookup: {
                from: types,
                localField: 'product.productType',
                foreignField: '_id',
                as: 'typeDoc',
              },
            },
            { $unwind: { path: '$typeDoc', preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: { $ifNull: ['$typeDoc._id', 'unspecified'] },
                name: { $first: { $ifNull: ['$typeDoc.name', 'Unspecified'] } },
                sales: { $sum: '$items.total' },
                units: { $sum: '$items.quantity' },
                orderIds: { $addToSet: '$_id' },
              },
            },
            {
              $project: {
                name: 1,
                sales: 1,
                units: 1,
                orders: { $size: '$orderIds' },
              },
            },
            { $sort: { sales: -1 } },
            { $limit: LIST_LIMIT },
          ],
          byCategory: [
            {
              $lookup: {
                from: categories,
                localField: 'product.category',
                foreignField: '_id',
                as: 'categoryDoc',
              },
            },
            { $unwind: { path: '$categoryDoc', preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: { $ifNull: ['$categoryDoc._id', 'unspecified'] },
                name: { $first: { $ifNull: ['$categoryDoc.name', 'Unspecified'] } },
                sales: { $sum: '$items.total' },
                units: { $sum: '$items.quantity' },
                orderIds: { $addToSet: '$_id' },
              },
            },
            {
              $project: {
                name: 1,
                sales: 1,
                units: 1,
                orders: { $size: '$orderIds' },
              },
            },
            { $sort: { sales: -1 } },
            { $limit: LIST_LIMIT },
          ],
          byTag: [
            { $unwind: { path: '$product.tagIds', preserveNullAndEmptyArrays: false } },
            {
              $lookup: {
                from: tags,
                localField: 'product.tagIds',
                foreignField: '_id',
                as: 'tagDoc',
              },
            },
            { $unwind: { path: '$tagDoc', preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: { $ifNull: ['$tagDoc._id', 'unspecified'] },
                name: { $first: { $ifNull: ['$tagDoc.name', 'Unspecified'] } },
                sales: { $sum: '$items.total' },
                units: { $sum: '$items.quantity' },
                orderIds: { $addToSet: '$_id' },
              },
            },
            {
              $project: {
                name: 1,
                sales: 1,
                units: 1,
                orders: { $size: '$orderIds' },
              },
            },
            { $sort: { sales: -1 } },
            { $limit: LIST_LIMIT },
          ],
          collections: [
            {
              $lookup: {
                from: entries,
                localField: 'product._id',
                foreignField: 'productId',
                as: 'entries',
              },
            },
            { $unwind: '$entries' },
            {
              $lookup: {
                from: collections,
                localField: 'entries.collectionId',
                foreignField: '_id',
                as: 'collection',
              },
            },
            { $unwind: '$collection' },
            { $match: { 'collection.storeId': storeObjectId } },
            {
              $group: {
                _id: '$collection._id',
                name: { $first: { $ifNull: ['$collection.title', 'Untitled collection'] } },
                sales: { $sum: '$items.total' },
                units: { $sum: '$items.quantity' },
                orderIds: { $addToSet: '$_id' },
                productIds: { $addToSet: '$product._id' },
              },
            },
            {
              $project: {
                name: 1,
                sales: 1,
                units: 1,
                orders: { $size: '$orderIds' },
                products: { $size: '$productIds' },
              },
            },
            { $sort: { sales: -1 } },
            { $limit: LIST_LIMIT },
          ],
          margin: [
            {
              $group: {
                _id: null,
                revenue: { $sum: '$items.total' },
                cogs: {
                  $sum: {
                    $multiply: [
                      '$items.quantity',
                      { $ifNull: ['$variant.cost', { $ifNull: ['$product.cost', 0] }] },
                    ],
                  },
                },
                units: { $sum: '$items.quantity' },
                unitsMissingCost: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: [{ $ifNull: ['$variant.cost', null] }, null] },
                          { $eq: [{ $ifNull: ['$product.cost', null] }, null] },
                        ],
                      },
                      '$items.quantity',
                      0,
                    ],
                  },
                },
              },
            },
          ],
          digitalMix: [
            {
              $group: {
                _id: {
                  $ifNull: ['$variant.isPhysicalProduct', { $ifNull: ['$product.isPhysicalProduct', true] }],
                },
                sales: { $sum: '$items.total' },
                units: { $sum: '$items.quantity' },
              },
            },
          ],
          markdownSold: [
            {
              $project: {
                qty: '$items.quantity',
                price: '$items.price',
                compareAt: { $ifNull: ['$variant.compareAtPrice', '$product.compareAtPrice'] },
              },
            },
            {
              $group: {
                _id: null,
                soldUnits: { $sum: '$qty' },
                soldOnSaleUnits: {
                  $sum: {
                    $cond: [
                      {
                        $and: [{ $gt: ['$compareAt', 0] }, { $lt: ['$price', '$compareAt'] }],
                      },
                      '$qty',
                      0,
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    ]),
    Product.countDocuments({ storeId: storeObjectId, isDeleted: { $ne: true }, status: 'active' }),
    Product.countDocuments({ storeId: storeObjectId, isDeleted: { $ne: true }, status: 'draft' }),
    ProductVariant.aggregate<{ total?: number; onSale?: number }>([
      {
        $lookup: {
          from: products,
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $match: {
          'product.storeId': storeObjectId,
          'product.isDeleted': { $ne: true },
        },
      },
      {
        $project: {
          price: 1,
          compareAt: { $ifNull: ['$compareAtPrice', '$product.compareAtPrice'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          onSale: {
            $sum: {
              $cond: [{ $and: [{ $gt: ['$compareAt', 0] }, { $gt: ['$compareAt', '$price'] }] }, 1, 0],
            },
          },
        },
      },
    ]),
  ]);

  const facet = facetRows[0] ?? {
    topSkus: [],
    topOptions: [],
    byVendor: [],
    byType: [],
    byCategory: [],
    byTag: [],
    collections: [],
    margin: [],
    digitalMix: [],
    markdownSold: [],
  };

  const marginRow = facet.margin[0] ?? {};
  const revenue = roundMoney(marginRow.revenue || 0);
  const cogs = roundMoney(marginRow.cogs || 0);
  const grossProfit = roundMoney(revenue - cogs);

  let physicalSales = 0;
  let physicalUnits = 0;
  let digitalSales = 0;
  let digitalUnits = 0;
  for (const row of facet.digitalMix) {
    if (row._id === false) {
      digitalSales += row.sales || 0;
      digitalUnits += row.units || 0;
    } else {
      physicalSales += row.sales || 0;
      physicalUnits += row.units || 0;
    }
  }
  const mixSales = physicalSales + digitalSales;

  const markdownSold = facet.markdownSold[0] ?? {};
  const soldUnits = markdownSold.soldUnits || 0;
  const soldOnSaleUnits = markdownSold.soldOnSaleUnits || 0;
  const catalogTotal = markdownCatalog[0]?.total || 0;
  const catalogOnSale = markdownCatalog[0]?.onSale || 0;
  const catalogSize = activeCount + draftCount;

  return {
    daySpan: days,
    topSkus: (facet.topSkus || []).map((row) => ({
      variantId: String(row._id ?? row.sku ?? 'unknown'),
      sku: row.sku || '—',
      title: row.title || 'Unknown product',
      options: formatOptionMap(row.optionValues),
      sales: roundMoney(row.sales || 0),
      units: row.units || 0,
      velocity: roundDays((row.units || 0) / days),
    })),
    topOptions: (facet.topOptions || [])
      .filter((row) => row.name && (row.value || 0) > 0)
      .map((row) => ({
        key: row.key || row.name || 'option',
        name: row.name || 'Option',
        value: row.value || 0,
      })),
    salesByVendor: moneyRows(facet.byVendor || []),
    salesByType: moneyRows(facet.byType || []),
    salesByCategory: moneyRows(facet.byCategory || []),
    salesByTag: moneyRows(facet.byTag || []),
    collections: (facet.collections || []).map((row) => ({
      collectionId: String(row._id ?? row.name ?? 'unknown'),
      name: row.name || 'Untitled collection',
      sales: roundMoney(row.sales || 0),
      units: row.units || 0,
      orders: row.orders || 0,
      products: row.products || 0,
    })),
    margin: {
      revenue,
      cogs,
      grossProfit,
      marginRate: roundRate(revenue > 0 ? grossProfit / revenue : 0),
      units: marginRow.units || 0,
      unitsMissingCost: marginRow.unitsMissingCost || 0,
    },
    digitalMix: {
      physicalSales: roundMoney(physicalSales),
      physicalUnits,
      digitalSales: roundMoney(digitalSales),
      digitalUnits,
      digitalRate: roundRate(mixSales > 0 ? digitalSales / mixSales : 0),
    },
    catalog: {
      active: activeCount,
      draft: draftCount,
      total: catalogSize,
      activeRate: roundRate(catalogSize > 0 ? activeCount / catalogSize : 0),
    },
    markdown: {
      catalogOnSale,
      catalogTotal,
      catalogRate: roundRate(catalogTotal > 0 ? catalogOnSale / catalogTotal : 0),
      soldOnSaleUnits,
      soldUnits,
      soldOnSaleRate: roundRate(soldUnits > 0 ? soldOnSaleUnits / soldUnits : 0),
    },
  };
}
