import mongoose from 'mongoose';
import { GeneralSettings } from '../models/general-settings/general-settings.model';
import { Order } from '../models/order/order.model';

const DEFAULT_START = 1001;

export type AllocatedOrderId = {
  sequence: number;
  displayOrderId: string;
};

/**
 * Atomically allocate the next display order id for a store using
 * GeneralSettings.orderIdPrefix / orderIdSuffix / nextOrderNumber.
 * Continues after legacy orders that have no orderSequence.
 */
export async function allocateStoreOrderId(
  storeId: string | mongoose.Types.ObjectId
): Promise<AllocatedOrderId> {
  const sid = typeof storeId === 'string' ? new mongoose.Types.ObjectId(storeId) : storeId;

  const [existingCount, maxSeqDoc] = await Promise.all([
    Order.countDocuments({ storeId: sid }),
    Order.findOne({ storeId: sid, orderSequence: { $exists: true, $ne: null } })
      .sort({ orderSequence: -1 })
      .select('orderSequence')
      .lean(),
  ]);

  const minNext = Math.max(
    DEFAULT_START,
    existingCount > 0 ? DEFAULT_START + existingCount : DEFAULT_START,
    ((maxSeqDoc?.orderSequence as number | undefined) ?? DEFAULT_START - 1) + 1
  );

  // Ensure one settings doc per store. Never upsert with a filter that can miss
  // an existing row — that inserts a second doc and trips unique storeId.
  await GeneralSettings.updateOne(
    { storeId: sid },
    {
      $setOnInsert: {
        storeId: sid,
        nextOrderNumber: minNext,
      },
    },
    { upsert: true, setDefaultsOnInsert: true }
  );

  // Raise the counter floor if orders already consumed higher numbers.
  await GeneralSettings.updateOne(
    {
      storeId: sid,
      $or: [{ nextOrderNumber: { $exists: false } }, { nextOrderNumber: { $lt: minNext } }],
    },
    { $set: { nextOrderNumber: minNext } }
  );

  const updated = await GeneralSettings.findOneAndUpdate(
    { storeId: sid },
    { $inc: { nextOrderNumber: 1 } },
    { new: true }
  );

  if (!updated) {
    throw new Error('Failed to allocate order number');
  }

  let sequence = (updated.nextOrderNumber as number) - 1;
  if (sequence < DEFAULT_START) {
    sequence = DEFAULT_START;
    await GeneralSettings.findOneAndUpdate(
      { storeId: sid },
      { $set: { nextOrderNumber: DEFAULT_START + 1 } }
    );
  }

  const prefix = updated.orderIdPrefix ?? '#';
  const suffix = updated.orderIdSuffix ?? '';

  return {
    sequence,
    displayOrderId: `${prefix}${sequence}${suffix}`,
  };
}
