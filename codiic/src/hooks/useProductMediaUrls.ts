import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { defaultContentFilesFolder } from '../contexts/store-cloud-storage.context';

/**
 * Manages product/variant media as cloud-storage URL references only.
 * Removing an image unlinks it from the entity — it does not delete the S3 object.
 */
export function useProductMediaUrls(initialUrls: string[] = [], resetKey?: string) {
  const [mediaUrls, setMediaUrls] = useState<string[]>(initialUrls);

  useEffect(() => {
    setMediaUrls(initialUrls);
  }, [resetKey]);

  const displayImages = useMemo(() => mediaUrls, [mediaUrls]);

  const addImageUrl = useCallback((url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setMediaUrls((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  }, []);

  const addImageUrls = useCallback((urls: string[]) => {
    setMediaUrls((prev) => {
      const next = [...prev];
      for (const raw of urls) {
        const url = raw.trim();
        if (url && !next.includes(url)) next.push(url);
      }
      return next;
    });
  }, []);

  const removeImage = useCallback((index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const resetMediaUrls = useCallback((urls: string[]) => {
    setMediaUrls(urls);
  }, []);

  const isDirtyComparedTo = useCallback(
    (baseline: string[]) => JSON.stringify(mediaUrls) !== JSON.stringify(baseline),
    [mediaUrls]
  );

  return {
    mediaUrls,
    displayImages,
    addImageUrl,
    addImageUrls,
    removeImage,
    resetMediaUrls,
    isDirtyComparedTo,
    setMediaUrls,
  };
}

type CloudUploadFn = (
  storeId: string,
  files: File[],
  options?: { folder?: string }
) => Promise<Array<{ objectUrl: string }>>;

type CloudSingleUploadFn = (
  storeId: string,
  file: File,
  options?: { folder?: string }
) => Promise<{ objectUrl: string }>;

export async function uploadImagesToCloudStorage(
  storeId: string,
  files: File[],
  uploadFilesForStore: CloudUploadFn
): Promise<string[]> {
  const imageFiles = files.filter((f) => f.type.startsWith('image/'));
  const rejected = files.length - imageFiles.length;
  if (rejected > 0) {
    toast.error(`Skipped ${rejected} non-image file${rejected > 1 ? 's' : ''}`);
  }
  if (!imageFiles.length) return [];

  const toastId = toast.loading(
    `Uploading ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} to files…`
  );
  try {
    const results = await uploadFilesForStore(storeId, imageFiles);
    const urls = results.map((r) => r.objectUrl).filter(Boolean);
    toast.success(
      `${urls.length} image${urls.length > 1 ? 's' : ''} added to your files`,
      { id: toastId }
    );
    return urls;
  } catch (err: unknown) {
    toast.error((err as Error)?.message || 'Failed to upload images', { id: toastId });
    throw err;
  }
}

function dataUrlToFile(dataUrl: string, fallbackName: string): File | null {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  const mimeType = match[1];
  const base64Data = match[2];
  const binary = window.atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const extension = mimeType.split('/')[1] || 'png';
  return new File([bytes], `${fallbackName}.${extension}`, { type: mimeType });
}

/** Upload inline description images (data URLs / blobs) into store cloud files. */
export async function uploadDescriptionImagesToCloudStorage(
  descriptionHtml: string,
  storeId: string,
  uploadFileForStore: CloudSingleUploadFn
): Promise<string> {
  if (!descriptionHtml.trim()) return descriptionHtml;

  const parser = new DOMParser();
  const doc = parser.parseFromString(descriptionHtml, 'text/html');
  const imageNodes = Array.from(doc.querySelectorAll('img[src]'));
  const localImages = imageNodes.filter((img) => {
    const src = img.getAttribute('src') || '';
    return src.startsWith('data:image/') || src.startsWith('blob:');
  });

  if (!localImages.length) return descriptionHtml;

  const uploadToastId = toast.loading(
    `Uploading ${localImages.length} description image${localImages.length > 1 ? 's' : ''} to files…`
  );

  try {
    await Promise.all(
      localImages.map(async (img, index) => {
        const src = img.getAttribute('src') || '';
        let file: File | null = null;
        if (src.startsWith('data:image/')) {
          file = dataUrlToFile(src, `description-image-${index + 1}`);
        } else if (src.startsWith('blob:')) {
          const blob = await fetch(src).then((res) => res.blob());
          const extension = (blob.type || 'image/png').split('/')[1] || 'png';
          file = new File([blob], `description-image-${index + 1}.${extension}`, {
            type: blob.type || 'image/png',
          });
        }
        if (!file) return;
        const uploaded = await uploadFileForStore(storeId, file, {
          folder: defaultContentFilesFolder(storeId),
        });
        img.setAttribute('src', uploaded.objectUrl);
      })
    );
    toast.success('Description images added to your files', { id: uploadToastId });
    return doc.body.innerHTML;
  } catch (err: unknown) {
    toast.error((err as Error)?.message || 'Failed to upload description images', {
      id: uploadToastId,
    });
    throw err;
  }
}
