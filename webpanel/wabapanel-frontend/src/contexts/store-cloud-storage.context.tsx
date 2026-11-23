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
import {
  toStoreMediaUploadResult,
  type StoreMediaUploadResult,
} from '@/lib/store-media-upload';

export type StoreCloudUpload = StoreMediaItem & { [key: string]: unknown };

export type StoreCloudUploadResult = StoreMediaUploadResult<StoreCloudUpload>;

type UploadFileForStoreOptions = { folder?: string };

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

  const uploadFileForStoreQuiet = useCallback(
    async (
      storeId: string,
      file: File,
      // The server decides the S3 folder (webpanel-stores/<id>/media) — kept
      // for signature parity with the Codiic cloud-storage contract.
      options?: UploadFileForStoreOptions
    ): Promise<StoreCloudUploadResult> => {
      void options;
      setImageUploadLoading(true);
      try {
        const item = await uploadStoreMediaFile(storeId, file);
        setUploads((prev) => [item as StoreCloudUpload, ...prev]);
        return toStoreMediaUploadResult(item as StoreCloudUpload, (u) =>
          resolveStoreMediaUrl(u)
        );
      } finally {
        setImageUploadLoading(false);
      }
    },
    []
  );

  const uploadFileForStore = useCallback(
    (storeId: string, file: File, options?: UploadFileForStoreOptions) =>
      uploadFileForStoreQuiet(storeId, file, options),
    [uploadFileForStoreQuiet]
  );

  const uploadFilesForStore = useCallback(
    async (
      storeId: string,
      files: File[],
      options?: UploadFileForStoreOptions
    ): Promise<StoreCloudUploadResult[]> => {
      const results: StoreCloudUploadResult[] = [];
      for (const file of files) {
        results.push(await uploadFileForStoreQuiet(storeId, file, options));
      }
      return results;
    },
    [uploadFileForStoreQuiet]
  );

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
      uploadFileForStore,
      uploadFilesForStore,
      uploadFileForStoreQuiet,
      resolveUploadPreviewUrl,
      clearError,
      clearUploads: () => setUploads([]),
    }),
    [uploads, loading, imageUploadLoading, error, fetchUploadsByStoreId, uploadFileForStore, uploadFilesForStore, uploadFileForStoreQuiet, resolveUploadPreviewUrl, clearError]
  );
}
