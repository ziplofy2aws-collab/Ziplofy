import mongoose, { Types } from 'mongoose';
import { Order, OrderItem, Product, ProductVariant } from '../../models';
import { InventoryLevelModel } from '../../models/inventory-level/inventory-level.model';
import { LocationModel } from '../../models/location/location.model';
import { CustomError } from '../../utils/error.utils';
import {
  assertValidAnalyticsRange,
  type AnalyticsRangeQuery,
} from './analytics-summary.service';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const LIST_LIMIT = 8;

export type AnalyticsInventoryQtyRow = {
  variantId: string;
  sku: string;
  title: string;
  options: string;
  onHand: number;
  available: number;
  committed: number;
  incoming: number;
  unavailable: number;
  value: number;
};

export type AnalyticsInventoryLocationRow = {
  locationId: string;
  name: string;
  onHand: number;
  available: number;
  committed: number;
  incoming: number;
  unavailable: number;
  value: number;
};

export type AnalyticsCoverRow = {
  variantId: string;
  sku: string;
  title: string;
  options: string;
  onHand: number;
  units: number;
  velocity: number;
  daysOfCover: number;
};

export type AnalyticsInventoryInsights = {
  daySpan: number;
  totals: {
    onHand: number;
    available: number;
    committed: number;
    incoming: number;
    unavailable: number;
    value: number;
    skusMissingCost: number;
    daysOfCover: number;
  };
  unavailableBreakdown: {
    damaged: number;
    qualityControl: number;
    safetyStock: number;
    other: number;
  };
  bySku: AnalyticsInventoryQtyRow[];
  byLocation: AnalyticsInventoryLocationRow[];
  committedBySku: AnalyticsInventoryQtyRow[];
  coverRisk: AnalyticsCoverRow[];
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

export async function getStoreInventoryAnalytics(
  query: AnalyticsRangeQuery,
): Promise<AnalyticsInventoryInsights> {
  const storeObjectId = assertStoreId(query.storeId);
  assertValidAnalyticsRange(query.from, query.to);
  const { from, to } = query;
  const days = daySpanInclusive(from, to);

  const locations = LocationModel.collection.name;
  const variants = ProductVariant.collection.name;
  const products = Product.collection.name;
  const orderItems = OrderItem.collection.name;

  const [snapshotRows, velocityRows] = await Promise.all([
    InventoryLevelModel.aggregate<{
      totals: Array<{
        onHand?: number;
        available?: number;
        committed?: number;
        incoming?: number;
        unavailable?: number;
        value?: number;
        skusMissingCost?: number;
      }>;
      unavailableBreakdown: Array<{
        damaged?: number;
        qualityControl?: number;
        safetyStock?: number;
        other?: number;
      }>;
      bySku: Array<{
        _id?: Types.ObjectId | null;
        sku?: string;
        title?: string;
        optionValues?: Record<string, string> | null;
        onHand?: number;
        available?: number;
        committed?: number;
        incoming?: number;
        unavailable?: number;
        value?: number;
      }>;
      byLocation: Array<{
        _id?: Types.ObjectId | null;
        name?: string;
        onHand?: number;
        available?: number;
        committed?: number;
        incoming?: number;
        unavailable?: number;
        value?: number;
      }>;
      committedBySku: Array<{
        _id?: Types.ObjectId | null;
        sku?: string;
        title?: string;
        optionValues?: Record<string, string> | null;
        onHand?: number;
        available?: number;
        committed?: number;
        incoming?: number;
        unavailable?: number;
        value?: number;
      }>;
      onHandByVariant: Array<{
        _id?: Types.ObjectId | null;
        sku?: string;
        title?: string;
        optionValues?: Record<string, string> | null;
        onHand?: number;
      }>;
    }>([
      {
        $lookup: {
          from: locations,
          localField: 'locationId',
          foreignField: '_id',
          as: 'location',
        },
      },
      { $unwind: '$location' },
      { $match: { 'location.storeId': storeObjectId } },
      {
        $lookup: {
          from: variants,
          localField: 'variantId',
          foreignField: '_id',
          as: 'variant',
        },
      },
      { $unwind: '$variant' },
      {
        $lookup: {
          from: products,
          localField: 'variant.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $match: {
          'product.storeId': storeObjectId,
          'product.isDeleted': { $ne: true },
          'variant.isInventoryTrackingEnabled': { $ne: false },
          'variant.depricated': { $ne: true },
        },
      },
      {
        $addFields: {
          unavailDamaged: { $ifNull: ['$unavailable.damaged', 0] },
          unavailQc: { $ifNull: ['$unavailable.qualityControl', 0] },
          unavailSafety: { $ifNull: ['$unavailable.safetyStock', 0] },
          unavailOther: { $ifNull: ['$unavailable.other', 0] },
          cost: { $ifNull: ['$variant.cost', { $ifNull: ['$product.cost', 0] }] },
          missingCost: {
            $and: [
              { $eq: [{ $ifNull: ['$variant.cost', null] }, null] },
              { $eq: [{ $ifNull: ['$product.cost', null] }, null] },
            ],
          },
        },
      },
      {
        $addFields: {
          unavailTotal: {
            $add: ['$unavailDamaged', '$unavailQc', '$unavailSafety', '$unavailOther'],
          },
          value: { $multiply: ['$onHand', '$cost'] },
        },
      },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                onHand: { $sum: '$onHand' },
                available: { $sum: '$available' },
                committed: { $sum: '$committed' },
                incoming: { $sum: '$incoming' },
                unavailable: { $sum: '$unavailTotal' },
                value: { $sum: '$value' },
                missingCostIds: {
                  $addToSet: {
                    $cond: [
                      { $and: ['$missingCost', { $gt: ['$onHand', 0] }] },
                      '$variantId',
                      '$$REMOVE',
                    ],
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                onHand: 1,
                available: 1,
                committed: 1,
                incoming: 1,
                unavailable: 1,
                value: 1,
                skusMissingCost: { $size: '$missingCostIds' },
              },
            },
          ],
          unavailableBreakdown: [
            {
              $group: {
                _id: null,
                damaged: { $sum: '$unavailDamaged' },
                qualityControl: { $sum: '$unavailQc' },
                safetyStock: { $sum: '$unavailSafety' },
                other: { $sum: '$unavailOther' },
              },
            },
            {
              $project: {
                _id: 0,
                damaged: 1,
                qualityControl: 1,
                safetyStock: 1,
                other: 1,
              },
            },
          ],
          bySku: [
            {
              $group: {
                _id: '$variantId',
                sku: { $first: { $ifNull: ['$variant.sku', '—'] } },
                title: { $first: { $ifNull: ['$product.title', 'Unknown product'] } },
                optionValues: { $first: '$variant.optionValues' },
                onHand: { $sum: '$onHand' },
                available: { $sum: '$available' },
                committed: { $sum: '$committed' },
                incoming: { $sum: '$incoming' },
                unavailable: { $sum: '$unavailTotal' },
                value: { $sum: '$value' },
              },
            },
            { $sort: { onHand: -1 } },
            { $limit: LIST_LIMIT },
          ],
          byLocation: [
            {
              $group: {
                _id: '$locationId',
                name: { $first: { $ifNull: ['$location.name', 'Unknown location'] } },
                onHand: { $sum: '$onHand' },
                available: { $sum: '$available' },
                committed: { $sum: '$committed' },
                incoming: { $sum: '$incoming' },
                unavailable: { $sum: '$unavailTotal' },
                value: { $sum: '$value' },
              },
            },
            { $sort: { onHand: -1 } },
          ],
          committedBySku: [
            { $match: { committed: { $gt: 0 } } },
            {
              $group: {
                _id: '$variantId',
                sku: { $first: { $ifNull: ['$variant.sku', '—'] } },
                title: { $first: { $ifNull: ['$product.title', 'Unknown product'] } },
                optionValues: { $first: '$variant.optionValues' },
                onHand: { $sum: '$onHand' },
                available: { $sum: '$available' },
                committed: { $sum: '$committed' },
                incoming: { $sum: '$incoming' },
                unavailable: { $sum: '$unavailTotal' },
                value: { $sum: '$value' },
              },
            },
            { $match: { committed: { $gt: 0 } } },
            { $sort: { committed: -1 } },
            { $limit: LIST_LIMIT },
          ],
          onHandByVariant: [
            {
              $group: {
                _id: '$variantId',
                sku: { $first: { $ifNull: ['$variant.sku', '—'] } },
                title: { $first: { $ifNull: ['$product.title', 'Unknown product'] } },
                optionValues: { $first: '$variant.optionValues' },
                onHand: { $sum: '$onHand' },
              },
            },
          ],
        },
      },
    ]),
    Order.aggregate<{ _id?: Types.ObjectId | null; units?: number }>([
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
        $group: {
          _id: '$items.productVariantId',
          units: { $sum: '$items.quantity' },
        },
      },
    ]),
  ]);

  const snapshot = snapshotRows[0] ?? {
    totals: [],
    unavailableBreakdown: [],
    bySku: [],
    byLocation: [],
    committedBySku: [],
    onHandByVariant: [],
  };

  const totalsRow = snapshot.totals[0] ?? {};
  const unavailRow = snapshot.unavailableBreakdown[0] ?? {};
  const onHand = totalsRow.onHand || 0;
  const value = roundMoney(totalsRow.value || 0);

  const unitsByVariant = new Map<string, number>();
  for (const row of velocityRows) {
    if (!row._id) continue;
    unitsByVariant.set(String(row._id), row.units || 0);
  }

  let trackedUnitsSold = 0;
  const coverRisk: AnalyticsCoverRow[] = [];
  for (const row of snapshot.onHandByVariant || []) {
    const variantId = String(row._id ?? '');
    if (!variantId) continue;
    const units = unitsByVariant.get(variantId) || 0;
    trackedUnitsSold += units;
    const velocity = roundDays(units / days);
    if (velocity <= 0) continue;
    coverRisk.push({
      variantId,
      sku: row.sku || '—',
      title: row.title || 'Unknown product',
      options: formatOptionMap(row.optionValues),
      onHand: row.onHand || 0,
      units,
      velocity,
      daysOfCover: roundDays((row.onHand || 0) / velocity),
    });
  }
  coverRisk.sort((a, b) => a.daysOfCover - b.daysOfCover || b.units - a.units);

  const trackedVelocity = trackedUnitsSold / days;
  const daysOfCover = roundDays(trackedVelocity > 0 ? onHand / trackedVelocity : 0);

  const toQtyRow = (row: {
    _id?: Types.ObjectId | null;
    sku?: string;
    title?: string;
    optionValues?: Record<string, string> | null;
    onHand?: number;
    available?: number;
    committed?: number;
    incoming?: number;
    unavailable?: number;
    value?: number;
  }): AnalyticsInventoryQtyRow => ({
    variantId: String(row._id ?? row.sku ?? 'unknown'),
    sku: row.sku || '—',
    title: row.title || 'Unknown product',
    options: formatOptionMap(row.optionValues),
    onHand: row.onHand || 0,
    available: row.available || 0,
    committed: row.committed || 0,
    incoming: row.incoming || 0,
    unavailable: row.unavailable || 0,
    value: roundMoney(row.value || 0),
  });

  return {
    daySpan: days,
    totals: {
      onHand,
      available: totalsRow.available || 0,
      committed: totalsRow.committed || 0,
      incoming: totalsRow.incoming || 0,
      unavailable: totalsRow.unavailable || 0,
      value,
      skusMissingCost: totalsRow.skusMissingCost || 0,
      daysOfCover,
    },
    unavailableBreakdown: {
      damaged: unavailRow.damaged || 0,
      qualityControl: unavailRow.qualityControl || 0,
      safetyStock: unavailRow.safetyStock || 0,
      other: unavailRow.other || 0,
    },
    bySku: (snapshot.bySku || []).map(toQtyRow),
    byLocation: (snapshot.byLocation || []).map((row) => ({
      locationId: String(row._id ?? row.name ?? 'unknown'),
      name: row.name || 'Unknown location',
      onHand: row.onHand || 0,
      available: row.available || 0,
      committed: row.committed || 0,
      incoming: row.incoming || 0,
      unavailable: row.unavailable || 0,
      value: roundMoney(row.value || 0),
    })),
    committedBySku: (snapshot.committedBySku || []).map(toQtyRow),
    coverRisk: coverRisk.slice(0, LIST_LIMIT),
  };
}
