import mongoose from 'mongoose';
import { Packaging } from '../models/packaging/packaging.model';

export type DefaultStorePackaging = {
  packagingId: string;
  packageName: string;
};

/**
 * Creates a default shipping package for a newly created store.
 * Safe to call more than once — skips if the store already has any packaging.
 */
export async function assignDefaultPackagingToStore(
  storeId: mongoose.Types.ObjectId | string
): Promise<DefaultStorePackaging | null> {
  const storeObjectId =
    typeof storeId === 'string' ? new mongoose.Types.ObjectId(storeId) : storeId;
  const storeIdStr = String(storeObjectId);

  const existingCount = await Packaging.countDocuments({ storeId: storeObjectId });
  if (existingCount > 0) {
    return null;
  }

  const packaging = await Packaging.create({
    storeId: storeObjectId,
    packageName: 'Default Box',
    packageType: 'box',
    length: 30,
    width: 20,
    height: 10,
    dimensionsUnit: 'cm',
    weight: 0.5,
    weightUnit: 'kg',
    isDefault: true,
  });

  console.log(
    `[assignDefaultPackagingToStore] Created default package "${packaging.packageName}" for store ${storeIdStr}`
  );

  return {
    packagingId: String(packaging._id),
    packageName: packaging.packageName,
  };
}
