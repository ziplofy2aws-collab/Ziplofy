'use client';

/**
 * Webpanel adapter for codiic `useStoreCloudStorage` — the image picker
 * lists/uploads per-store media. Backed by the webpanel store media API.
 */

import { useCallback, useMemo, useState } from 'react';
import {
  storeMediaApi,
  uploadStoreMediaFile,
  resolveStoreMediaUrl,
  type StoreMediaItem,
} from '@/lib/store-media';

export type StoreCloudUpload = StoreMediaItem & { [key: string]: unknown };

/** S3 folder for editor-uploaded content files (codiic parity). */
export const defaultContentFilesFolder = (storeId: string) =>
  `webpanel-stores/${storeId}/content-files`;

export const fileNameFromStorageKey = (key: string): string => {
  const segment = key.split('/').filter(Boolean).pop();
  return segment || key;
};

export const isImageStorageKey = (key: string): boolean =>
  /\.(jpe?g|png|gif|webp|svg|avif|bmp|heic|heif)$/i.test(key);

export function useStoreCloudStorage() {
  const [uploads, setUploads] = useState<StoreCloudUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUploadsByStoreId = useCallback(async (storeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await storeMediaApi.list(storeId);
      const items = (res.data?.data ?? []) as StoreCloudUpload[];
      setUploads(items);
      return items;
    } catch (e) {
      setError((e as Error)?.message ?? 'Failed to load media');
      return [] as StoreCloudUpload[];
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFileForStoreQuiet = useCallback(async (storeId: string, file: File) => {
    setImageUploadLoading(true);
    try {
      const item = await uploadStoreMediaFile(storeId, file);
      setUploads((prev) => [item as StoreCloudUpload, ...prev]);
      return item as StoreCloudUpload;
    } finally {
      setImageUploadLoading(false);
    }
  }, []);

  const resolveUploadPreviewUrl = useCallback((upload: StoreCloudUpload) => {
    return resolveStoreMediaUrl(upload) || upload.url || '';
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return useMemo(
    () => ({
      uploads,
      loading,
      imageUploadLoading,
      error,
      fetchUploadsByStoreId,
      uploadFileForStoreQuiet,
      resolveUploadPreviewUrl,
      clearError,
      clearUploads: () => setUploads([]),
    }),
    [uploads, loading, imageUploadLoading, error, fetchUploadsByStoreId, uploadFileForStoreQuiet, resolveUploadPreviewUrl, clearError]
  );
}
