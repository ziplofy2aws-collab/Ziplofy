/**
 * Upload-result shape expected by theme-editor / product image pickers —
 * ported from the Codiic storefront cloud-storage contract where upload
 * helpers resolve `{ upload, objectUrl, key }`.
 *
 * `objectUrl` must be a renderable URL (the media proxy URL), mirroring what
 * `resolveUploadPreviewUrl` produces for items already in the library, so a
 * freshly uploaded image selects exactly like a grid click.
 */
export type StoreMediaUploadResult<TUpload> = {
  upload: TUpload;
  objectUrl: string;
  key: string;
};

export function toStoreMediaUploadResult<
  TUpload extends { key?: string; url?: string | null },
>(upload: TUpload, resolveUrl: (upload: TUpload) => string | null | undefined) {
  const objectUrl = resolveUrl(upload) || upload.url || '';
  const result: StoreMediaUploadResult<TUpload> = {
    upload,
    objectUrl,
    key: upload.key || '',
  };
  return result;
}
