import mongoose, { Types } from 'mongoose';
import { ProductVariant, Store } from '../../models';
import { InventoryLevelModel } from '../../models/inventory-level/inventory-level.model';
import { LocationModel } from '../../models/location/location.model';
import { CustomError } from '../../utils/error.utils';

type OrderLine = {
  productVariantId: string;
  quantity: number;
};

function unavailableTotal(unavailable?: {
  damaged?: number;
  qualityControl?: number;
  safetyStock?: number;
  other?: number;
} | null): number {
  if (!unavailable) return 0;
  return (
    (unavailable.damaged || 0) +
    (unavailable.qualityControl || 0) +
    (unavailable.safetyStock || 0) +
    (unavailable.other || 0)
  );
}

function recomputeAvailable(onHand: number, committed: number, unavailable: unknown): number {
  return Math.max(0, (onHand || 0) - (committed || 0) - unavailableTotal(unavailable as any));
}

function aggregateQuantitiesByVariant(items: OrderLine[]): Map<string, number> {
  const byVariant = new Map<string, number>();
  for (const item of items) {
    const key = String(item.productVariantId);
    byVariant.set(key, (byVariant.get(key) || 0) + item.quantity);
  }
  return byVariant;
}

export async function resolveOrderFulfillmentLocationId(
  storeId: string
): Promise<Types.ObjectId> {
  const store = await Store.findById(storeId).select('defaultLocation').lean();
  if (store?.defaultLocation) {
    return new Types.ObjectId(String(store.defaultLocation));
  }

  const location = await LocationModel.findOne({
    storeId: new Types.ObjectId(storeId),
    isActive: true,
  })
    .sort({ createdAt: 1 })
    .select('_id')
    .lean();

  if (!location?._id) {
    throw new CustomError('No active location found to allocate inventory for this store', 400);
  }

  return new Types.ObjectId(String(location._id));
}

/**
 * Shopify-style reservation on order place:
 * - committed += qty
 * - available = onHand - committed - unavailable (clamped >= 0)
 * - onHand unchanged until fulfillment
 *
 * Skips variants with inventory tracking disabled.
 * Blocks when available < qty unless outOfStockContinueSelling is true.
 */
export async function commitInventoryForOrderItems(params: {
  storeId: string;
  items: OrderLine[];
  locationId?: Types.ObjectId;
}): Promise<{ locationId: Types.ObjectId }> {
  const { storeId, items } = params;
  if (!items.length) return { locationId: params.locationId ?? (await resolveOrderFulfillmentLocationId(storeId)) };

  const locationId = params.locationId ?? (await resolveOrderFulfillmentLocationId(storeId));
  const quantities = aggregateQuantitiesByVariant(items);

  const committed: Array<{ variantId: string; quantity: number }> = [];

  try {
    for (const [variantId, quantity] of quantities) {
      if (!mongoose.Types.ObjectId.isValid(variantId) || quantity < 1) continue;

      const variant = await ProductVariant.findById(variantId)
        .select('isInventoryTrackingEnabled outOfStockContinueSelling sku productId')
        .populate<{ productId: { title?: string } | Types.ObjectId }>('productId', 'title')
        .lean();

      if (!variant) {
        throw new CustomError(`Product variant not found: ${variantId}`, 404);
      }

      if (!variant.isInventoryTrackingEnabled) {
        continue;
      }

      let level = await InventoryLevelModel.findOne({
        variantId: new Types.ObjectId(variantId),
        locationId,
      });

      if (!level) {
        level = await InventoryLevelModel.create({
          variantId: new Types.ObjectId(variantId),
          locationId,
          onHand: 0,
          committed: 0,
          available: 0,
          incoming: 0,
          unavailable: { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 },
        });
      }

      const availableNow = recomputeAvailable(level.onHand, level.committed, level.unavailable);
      if (availableNow < quantity && !variant.outOfStockContinueSelling) {
        const productTitle =
          variant.productId &&
          typeof variant.productId === 'object' &&
          'title' in variant.productId &&
          typeof variant.productId.title === 'string'
            ? variant.productId.title.trim()
            : '';
        const label = productTitle || variant.sku || 'This item';
        const message =
          availableNow <= 0
            ? `Sorry, "${label}" has sold out. Please remove it from your cart and try again.`
            : `Sorry, only ${availableNow} left of "${label}". Please update your cart and try again.`;
        throw new CustomError(message, 400);
      }

      level.committed = (level.committed || 0) + quantity;
      level.available = recomputeAvailable(level.onHand, level.committed, level.unavailable);
      await level.save();
      committed.push({ variantId, quantity });
    }
  } catch (err) {
    if (committed.length > 0) {
      await releaseInventoryForOrderItems({
        storeId,
        locationId,
        items: committed.map((row) => ({
          productVariantId: row.variantId,
          quantity: row.quantity,
        })),
      });
    }
    throw err;
  }

  return { locationId };
}

/**
 * Reverse a previous commit (best-effort compensation if order creation fails after reserve).
 */
export async function releaseInventoryForOrderItems(params: {
  storeId: string;
  items: OrderLine[];
  locationId: Types.ObjectId;
}): Promise<void> {
  const { items, locationId } = params;
  const quantities = aggregateQuantitiesByVariant(items);

  for (const [variantId, quantity] of quantities) {
    if (!mongoose.Types.ObjectId.isValid(variantId) || quantity < 1) continue;

    const variant = await ProductVariant.findById(variantId)
      .select('isInventoryTrackingEnabled')
      .lean();
    if (!variant?.isInventoryTrackingEnabled) continue;

    const level = await InventoryLevelModel.findOne({
      variantId: new Types.ObjectId(variantId),
      locationId,
    });
    if (!level) continue;

    level.committed = Math.max(0, (level.committed || 0) - quantity);
    level.available = recomputeAvailable(level.onHand, level.committed, level.unavailable);
    await level.save();
  }
}
