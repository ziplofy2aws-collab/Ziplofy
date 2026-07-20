import { useCallback } from 'react';
import { defaultContentFilesFolder, useStoreCloudStorage } from '../contexts/store-cloud-storage.context';
import {
  descriptionHasPendingLocalImages,
  isDescriptionWithinMaxLength,
  sanitizeProductDescriptionHtml,
} from '../utils/product-description-html.util';
import { uploadDescriptionImagesToCloudStorage } from './useProductMediaUrls';

export function useDescriptionCloudStorageSave(storeId: string | undefined) {
  const { uploadFileForStore } = useStoreCloudStorage();

  return useCallback(
    async (descriptionHtml: string): Promise<string> => {
      if (!storeId) {
        throw new Error('Select a store before saving description images');
      }
      if (descriptionHasPendingLocalImages(descriptionHtml)) {
        throw new Error('Some description images are still uploading. Try again in a moment.');
      }

      let html = await uploadDescriptionImagesToCloudStorage(descriptionHtml, storeId, (sid, file, options) =>
        uploadFileForStore(sid, file, {
          folder: options?.folder ?? defaultContentFilesFolder(sid),
        }).then((r) => ({ objectUrl: r.objectUrl }))
      );
      html = sanitizeProductDescriptionHtml(html);
      if (!isDescriptionWithinMaxLength(html)) {
        throw new Error('Description is too long (max 5000 characters)');
      }
      return html;
    },
    [storeId, uploadFileForStore]
  );
}
