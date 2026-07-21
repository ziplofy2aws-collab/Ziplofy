import mongoose from 'mongoose';
import { StoreCloudStorage } from '../models/store-cloud-storage/store-cloud-storage.model';
import { CustomError } from './error.utils';

export function extractStoreContentFileKey(url: string, storeId: string): string | null {
  const prefix = `stores/${storeId}/content-files/`;
  try {
    const parsed = new URL(url.trim());
    const path = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
    if (!path.startsWith(prefix)) return null;
    return path;
  } catch {
    return null;
  }
}

export async function assertOptionalStoreCloudImageUrl(
  storeId: string,
  url: string | null | undefined
): Promise<void> {
  if (!url || !String(url).trim()) return;
  if (!mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  const key = extractStoreContentFileKey(String(url), storeId);
  if (!key) {
    throw new CustomError('Image must be chosen from store cloud files', 400);
  }

  const registered = await StoreCloudStorage.findOne({ storeId, key }).select('_id').lean();
  if (!registered) {
    throw new CustomError('Image is not registered in store cloud files', 400);
  }
}

export async function assertStoreCloudImageUrls(storeId: string, urls: string[]): Promise<void> {
  if (!Array.isArray(urls) || !urls.length) return;
  for (const url of urls) {
    await assertOptionalStoreCloudImageUrl(storeId, url);
  }
}
