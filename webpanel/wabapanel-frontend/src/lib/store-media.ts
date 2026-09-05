import api from '@/lib/api';

export type StoreMediaItem = {
  _id: string;
  storeId: string;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
  updatedAt?: string;
};

export type ImageSignedUrlData = {
  signedUrl: string;
  key: string;
  bucket: string;
  region: string;
  method: 'PUT';
  contentType: string;
  expiresInSeconds: number;
  objectUrl: string;
};

const S3_META_KEY = 'webpanel_store_media_s3_meta';

export function storeMediaFolder(storeId: string): string {
  return `webpanel-stores/${storeId}/media`;
}

export function readStoredS3Meta(): { bucket: string; region: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(S3_META_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { bucket?: string; region?: string };
    if (parsed.bucket && parsed.region) return { bucket: parsed.bucket, region: parsed.region };
  } catch {
    /* ignore */
  }
  return null;
}

export function persistS3Meta(meta: { bucket: string; region: string } | null) {
  if (!meta || typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(S3_META_KEY, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
}

/** Bootstrap bucket/region for preview URLs (Codiic ensureS3Meta parity). */
export async function ensureS3Meta(): Promise<{ bucket: string; region: string } | null> {
  const stored = readStoredS3Meta();
  if (stored) return stored;
  try {
    const data = await requestImageSignedUrl({
      fileName: 'preview-bootstrap.png',
      fileType: 'image/png',
      folder: 'uploads/images',
    });
    return { bucket: data.bucket, region: data.region };
  } catch {
    return null;
  }
}

export function applyS3MetaFromListResponse(s3?: { bucket?: string; region?: string } | null) {
  if (s3?.bucket && s3?.region) {
    persistS3Meta({ bucket: s3.bucket, region: s3.region });
  }
}

export function buildS3ObjectUrl(key: string, bucket: string, region: string): string {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export function resolveStoreMediaUrl(item: StoreMediaItem): string {
  if (item.url?.startsWith('http')) return item.url;
  const meta = readStoredS3Meta();
  if (meta) return buildS3ObjectUrl(item.key, meta.bucket, meta.region);
  return item.url || '';
}

export function fileNameFromKey(key: string): string {
  const segment = key.split('/').filter(Boolean).pop();
  return segment || key;
}

export async function requestImageSignedUrl(payload: {
  fileName: string;
  fileType: string;
  folder: string;
}): Promise<ImageSignedUrlData> {
  const res = await api.post<{ success: boolean; data: ImageSignedUrlData; message?: string }>(
    '/aws/signed-url/image',
    payload
  );
  if (!res.data?.success || !res.data.data) {
    throw new Error(res.data?.message || 'Failed to get signed URL');
  }
  persistS3Meta({ bucket: res.data.data.bucket, region: res.data.data.region });
  return res.data.data;
}

export async function uploadFileToSignedUrl(
  signedUrl: string,
  file: File,
  contentType: string
): Promise<void> {
  const res = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType || file.type || 'application/octet-stream' },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`S3 upload failed (${res.status})`);
  }
}

export async function uploadStoreMediaFile(
  storeId: string,
  file: File
): Promise<StoreMediaItem> {
  const signed = await requestImageSignedUrl({
    fileName: file.name,
    fileType: file.type,
    folder: storeMediaFolder(storeId),
  });
  await uploadFileToSignedUrl(signed.signedUrl, file, signed.contentType);
  const res = await api.post<{ success: boolean; data: StoreMediaItem; message?: string }>(
    `/stores/${storeId}/media/register`,
    {
      key: signed.key,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: signed.objectUrl,
    }
  );
  if (!res.data?.success || !res.data.data) {
    throw new Error(res.data?.message || 'Failed to register upload');
  }
  return res.data.data;
}

/** Same-origin fetch for theme editor canvas (avoids S3 CORS taint). */
export async function fetchStoreMediaBlobForEditor(
  storeId: string,
  imageUrl: string
): Promise<Blob> {
  const res = await api.get<Blob>(`/stores/${storeId}/media/editor-proxy`, {
    params: { url: imageUrl },
    responseType: 'blob',
  });
  const blob = res.data;
  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error('Failed to load image from store media');
  }
  if (blob.type.includes('json')) {
    try {
      const text = await blob.text();
      const parsed = JSON.parse(text) as { message?: string };
      throw new Error(parsed.message || 'Failed to load image from store media');
    } catch (err) {
      if (err instanceof Error && err.message !== 'Failed to load image from store media') {
        throw err;
      }
      throw new Error('Failed to load image from store media');
    }
  }
  return blob;
}

export const storeMediaApi = {
  list: (storeId: string) =>
    api.get<{ success: boolean; data: StoreMediaItem[]; count?: number; s3?: { bucket?: string; region?: string } }>(
      `/stores/${storeId}/media`
    ),
  register: (
    storeId: string,
    payload: { key: string; originalName?: string; mimeType?: string; size?: number; url?: string }
  ) =>
    api.post<{ success: boolean; data: StoreMediaItem }>(`/stores/${storeId}/media/register`, payload),
  delete: (storeId: string, mediaId: string) =>
    api.delete<{ success: boolean }>(`/stores/${storeId}/media/${mediaId}`),
  deleteAll: (storeId: string) =>
    api.delete<{
      success: boolean;
      message?: string;
      data?: { deletedFromS3: number; deletedFromDatabase: number };
    }>(`/stores/${storeId}/media/all`),
  checkAwsStatus: () =>
    api.get<{ success: boolean; data: { configured: boolean; bucket?: string; region?: string } }>(
      '/aws/status'
    ),
  deleteS3Keys: (imageKeys: string[]) =>
    api.post<{ success: boolean }>('/aws/delete-images', { imageKeys }),
};
