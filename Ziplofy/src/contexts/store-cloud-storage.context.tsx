import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { axiosi } from '../config/axios.config';
import { useAwsUpload, type ImageSignedUrlData } from './aws-upload.context';

export interface StoreCloudStorageUpload {
  _id: string;
  storeId: string;
  key: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
}

export interface RegisterStoreUploadPayload {
  storeId: string;
  key: string;
}

export interface UploadFileForStoreOptions {
  folder?: string;
  expiresInSeconds?: number;
}

type S3ObjectMeta = Pick<ImageSignedUrlData, 'bucket' | 'region'>;

interface StoreCloudStorageContextType {
  uploads: StoreCloudStorageUpload[];
  /** Loading registered files from the API. */
  loading: boolean;
  /** Presign + S3 PUT + register (image upload flow). */
  imageUploadLoading: boolean;
  /** Removing a file record (and optional S3 delete). */
  deleteLoading: boolean;
  error: string | null;
  /** S3 bucket/region from the last presigned-url response (via AwsUploadContext). */
  lastS3Meta: S3ObjectMeta | null;
  fetchUploadsByStoreId: (storeId: string) => Promise<StoreCloudStorageUpload[]>;
  registerUpload: (payload: RegisterStoreUploadPayload) => Promise<StoreCloudStorageUpload>;
  deleteUpload: (
    uploadId: string,
    options?: { deleteFromS3?: boolean; key?: string }
  ) => Promise<void>;
  /**
   * AwsUploadContext (presign + PUT) → register with backend. Updates local `uploads`.
   */
  uploadFileForStore: (
    storeId: string,
    file: File,
    options?: UploadFileForStoreOptions
  ) => Promise<{ upload: StoreCloudStorageUpload; objectUrl: string; key: string }>;
  uploadFilesForStore: (
    storeId: string,
    files: File[],
    options?: UploadFileForStoreOptions
  ) => Promise<Array<{ upload: StoreCloudStorageUpload; objectUrl: string; key: string }>>;
  /** One file upload without toggling `imageUploadLoading` (for per-file queue UIs). */
  uploadFileForStoreQuiet: (
    storeId: string,
    file: File,
    options?: UploadFileForStoreOptions
  ) => Promise<{ upload: StoreCloudStorageUpload; objectUrl: string; key: string }>;
  getObjectUrlForKey: (key: string) => string | null;
  /** Resolve a public S3 URL for a registered upload (needs bucket/region meta). */
  resolveUploadPreviewUrl: (upload: StoreCloudStorageUpload) => string | null;
  /** Load bucket/region from session or presign API so list previews can render. */
  ensureS3Meta: () => Promise<S3ObjectMeta | null>;
  clearUploads: () => void;
  clearError: () => void;
}

const CLOUD_STORAGE_BASE = '/store/cloud-storage';

const StoreCloudStorageContext = createContext<StoreCloudStorageContextType | undefined>(
  undefined
);

export const defaultContentFilesFolder = (storeId: string) =>
  `stores/${storeId}/content-files`;

export const buildS3ObjectUrl = (
  key: string,
  bucket: string,
  region: string
): string => `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

const S3_META_STORAGE_KEY = 'ziplofy_content_files_s3_meta';

export const parseS3MetaFromObjectUrl = (objectUrl: string): S3ObjectMeta | null => {
  const match = objectUrl.match(/^https:\/\/([^.]+)\.s3\.([^.]+)\.amazonaws\.com\//);
  if (!match) return null;
  return { bucket: match[1]!, region: match[2]! };
};

const readStoredS3Meta = (): S3ObjectMeta | null => {
  try {
    const raw = sessionStorage.getItem(S3_META_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { bucket?: string; region?: string };
    if (parsed.bucket && parsed.region) return { bucket: parsed.bucket, region: parsed.region };
  } catch {
    /* ignore */
  }
  return null;
};

const persistS3Meta = (meta: S3ObjectMeta | null) => {
  if (!meta) return;
  try {
    sessionStorage.setItem(S3_META_STORAGE_KEY, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
};

export const fileNameFromStorageKey = (key: string): string => {
  const segment = key.split('/').filter(Boolean).pop();
  return segment || key;
};

export const isImageStorageKey = (key: string): boolean =>
  /\.(jpe?g|png|gif|webp|svg|avif|bmp|heic|heif)$/i.test(key);

const isValidStoreObjectId = (storeId: string): boolean => /^[a-f\d]{24}$/i.test(storeId);

/** Must be rendered inside AwsUploadProvider. */
const StoreCloudStorageProviderInner: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    uploadImageWithSignedUrl,
    deleteImagesFromS3,
    lastSignedUrlData,
    generateImageUploadSignedUrl,
  } = useAwsUpload();

  const [uploads, setUploads] = useState<StoreCloudStorageUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storedS3Meta, setStoredS3Meta] = useState<S3ObjectMeta | null>(readStoredS3Meta);

  const lastS3Meta = useMemo((): S3ObjectMeta | null => {
    if (lastSignedUrlData) {
      return { bucket: lastSignedUrlData.bucket, region: lastSignedUrlData.region };
    }
    return storedS3Meta;
  }, [lastSignedUrlData, storedS3Meta]);

  const getObjectUrlForKey = useCallback(
    (key: string): string | null => {
      if (!lastS3Meta?.bucket || !lastS3Meta?.region || !key) return null;
      return buildS3ObjectUrl(key, lastS3Meta.bucket, lastS3Meta.region);
    },
    [lastS3Meta]
  );

  const ensureS3Meta = useCallback(async (): Promise<S3ObjectMeta | null> => {
    if (lastS3Meta?.bucket && lastS3Meta?.region) return lastS3Meta;

    const stored = readStoredS3Meta();
    if (stored?.bucket && stored?.region) {
      setStoredS3Meta(stored);
      return stored;
    }

    try {
      const data = await generateImageUploadSignedUrl({
        fileName: 'preview-bootstrap.png',
        fileType: 'image/png',
        folder: 'uploads/images',
      });
      const meta = { bucket: data.bucket, region: data.region };
      setStoredS3Meta(meta);
      persistS3Meta(meta);
      return meta;
    } catch {
      return null;
    }
  }, [lastS3Meta, generateImageUploadSignedUrl]);

  const resolveUploadPreviewUrl = useCallback(
    (upload: StoreCloudStorageUpload): string | null => {
      if (!isImageStorageKey(upload.key)) return null;
      return (
        getObjectUrlForKey(upload.key) ??
        (lastS3Meta
          ? buildS3ObjectUrl(upload.key, lastS3Meta.bucket, lastS3Meta.region)
          : null)
      );
    },
    [getObjectUrlForKey, lastS3Meta]
  );

  const persistRegisteredUpload = useCallback(async (payload: RegisterStoreUploadPayload) => {
    const res = await axiosi.post<ApiResponse<StoreCloudStorageUpload>>(
      `${CLOUD_STORAGE_BASE}/register`,
      { storeId: payload.storeId, key: payload.key.trim() }
    );
    const { success, data, message } = res.data;
    if (!success || !data) throw new Error(message || 'Failed to register upload');
    setUploads((prev) => [data, ...prev.filter((u) => u._id !== data._id)]);
    return data;
  }, []);

  const fetchUploadsByStoreId = useCallback(async (storeId: string) => {
    if (!isValidStoreObjectId(storeId)) {
      const msg = 'Select a valid store before loading files';
      setError(msg);
      setUploads([]);
      throw new Error(msg);
    }

    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ApiResponse<StoreCloudStorageUpload[]>>(
        `${CLOUD_STORAGE_BASE}/store/${storeId}`
      );
      const { success, data, message } = res.data;
      if (!success) throw new Error(message || 'Failed to fetch store files');
      const list = Array.isArray(data) ? data : [];
      setUploads(list);
      if (list.length > 0) {
        await ensureS3Meta();
      }
      return list;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to fetch store files';
      setError(msg);
      setUploads([]);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [ensureS3Meta]);

  const registerUpload = useCallback(
    async (payload: RegisterStoreUploadPayload) => {
      try {
        setImageUploadLoading(true);
        setError(null);
        return await persistRegisteredUpload(payload);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to register upload';
        setError(msg);
        throw new Error(msg);
      } finally {
        setImageUploadLoading(false);
      }
    },
    [persistRegisteredUpload]
  );

  const deleteUpload = useCallback(
    async (uploadId: string, options?: { deleteFromS3?: boolean; key?: string }) => {
      const s3Key = options?.key ?? uploads.find((u) => u._id === uploadId)?.key;
      try {
        setDeleteLoading(true);
        setError(null);

        if (options?.deleteFromS3 && s3Key) {
          await deleteImagesFromS3({ imageKeys: [s3Key] });
        }

        const res = await axiosi.delete<ApiResponse<{ id: string; storeId: string; key: string }>>(
          `${CLOUD_STORAGE_BASE}/${uploadId}`
        );
        const { success, message } = res.data;
        if (!success) throw new Error(message || 'Failed to delete upload record');

        setUploads((prev) => prev.filter((u) => u._id !== uploadId));
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to delete upload';
        setError(msg);
        throw new Error(msg);
      } finally {
        setDeleteLoading(false);
      }
    },
    [uploads, deleteImagesFromS3]
  );

  const uploadFileForStoreCore = useCallback(
    async (storeId: string, file: File, options?: UploadFileForStoreOptions) => {
      if (!storeId) throw new Error('storeId is required');
      if (!file) throw new Error('File is required');

      setError(null);

      const { key, objectUrl } = await uploadImageWithSignedUrl(file, {
        folder: options?.folder ?? defaultContentFilesFolder(storeId),
        expiresInSeconds: options?.expiresInSeconds,
      });

      const meta =
        parseS3MetaFromObjectUrl(objectUrl) ??
        (lastSignedUrlData
          ? { bucket: lastSignedUrlData.bucket, region: lastSignedUrlData.region }
          : null);
      if (meta) {
        setStoredS3Meta(meta);
        persistS3Meta(meta);
      }

      const upload = await persistRegisteredUpload({ storeId, key });

      return { upload, key, objectUrl };
    },
    [uploadImageWithSignedUrl, persistRegisteredUpload, lastSignedUrlData]
  );

  const uploadFileForStoreQuiet = useCallback(
    async (storeId: string, file: File, options?: UploadFileForStoreOptions) => {
      try {
        return await uploadFileForStoreCore(storeId, file, options);
      } catch (err: unknown) {
        const msg = (err as Error)?.message || 'Failed to upload file';
        setError(msg);
        throw new Error(msg);
      }
    },
    [uploadFileForStoreCore]
  );

  const uploadFileForStore = useCallback(
    async (storeId: string, file: File, options?: UploadFileForStoreOptions) => {
      try {
        setImageUploadLoading(true);
        return await uploadFileForStoreQuiet(storeId, file, options);
      } finally {
        setImageUploadLoading(false);
      }
    },
    [uploadFileForStoreQuiet]
  );

  const uploadFilesForStore = useCallback(
    async (storeId: string, files: File[], options?: UploadFileForStoreOptions) => {
      if (!files.length) return [];
      try {
        setImageUploadLoading(true);
        setError(null);
        const results = [];
        for (const file of files) {
          results.push(await uploadFileForStoreCore(storeId, file, options));
        }
        return results;
      } catch (err: unknown) {
        const msg = (err as Error)?.message || 'Failed to upload files';
        setError(msg);
        throw new Error(msg);
      } finally {
        setImageUploadLoading(false);
      }
    },
    [uploadFileForStoreCore]
  );

  const clearUploads = useCallback(() => {
    setUploads([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<StoreCloudStorageContextType>(
    () => ({
      uploads,
      loading,
      imageUploadLoading,
      deleteLoading,
      error,
      lastS3Meta,
      fetchUploadsByStoreId,
      registerUpload,
      deleteUpload,
      uploadFileForStore,
      uploadFilesForStore,
      uploadFileForStoreQuiet,
      getObjectUrlForKey,
      resolveUploadPreviewUrl,
      ensureS3Meta,
      clearUploads,
      clearError,
    }),
    [
      uploads,
      loading,
      imageUploadLoading,
      deleteLoading,
      error,
      lastS3Meta,
      fetchUploadsByStoreId,
      registerUpload,
      deleteUpload,
      uploadFileForStore,
      uploadFilesForStore,
      uploadFileForStoreQuiet,
      getObjectUrlForKey,
      resolveUploadPreviewUrl,
      ensureS3Meta,
      clearUploads,
      clearError,
    ]
  );

  return (
    <StoreCloudStorageContext.Provider value={value}>{children}</StoreCloudStorageContext.Provider>
  );
};

export const StoreCloudStorageProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <StoreCloudStorageProviderInner>{children}</StoreCloudStorageProviderInner>
);

export const useStoreCloudStorage = (): StoreCloudStorageContextType => {
  const ctx = useContext(StoreCloudStorageContext);
  if (!ctx) {
    throw new Error('useStoreCloudStorage must be used within a StoreCloudStorageProvider');
  }
  return ctx;
};

export default StoreCloudStorageContext;
