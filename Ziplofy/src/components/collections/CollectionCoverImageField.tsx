import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useStore } from '../../contexts/store.context';
import {
  defaultContentFilesFolder,
  useStoreCloudStorage,
} from '../../contexts/store-cloud-storage.context';
import { uploadImagesToCloudStorage } from '../../hooks/useProductMediaUrls';
import { SelectImageModal, type SelectedImageAsset } from '../SelectImageModal';

type CollectionCoverImageFieldProps = {
  imageUrl: string;
  imageAlt?: string;
  onImageUrlChange: (url: string) => void;
  disabled?: boolean;
  compact?: boolean;
};

const CollectionCoverImageField: React.FC<CollectionCoverImageFieldProps> = ({
  imageUrl,
  imageAlt = 'Collection',
  onImageUrlChange,
  disabled = false,
  compact = false,
}) => {
  const { activeStoreId } = useStore();
  const { uploadFilesForStore } = useStoreCloudStorage();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const openPicker = useCallback(() => {
    if (disabled || uploading) return;
    if (!activeStoreId) {
      toast.error('Select a store before choosing files');
      return;
    }
    setPickerOpen(true);
  }, [activeStoreId, disabled, uploading]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!activeStoreId || disabled || uploading) return;
      setUploading(true);
      try {
        const urls = await uploadImagesToCloudStorage(activeStoreId, [file], (storeId, files, options) =>
          uploadFilesForStore(storeId, files, {
            folder: options?.folder ?? defaultContentFilesFolder(storeId),
          })
        );
        if (urls[0]) onImageUrlChange(urls[0]);
      } finally {
        setUploading(false);
      }
    },
    [activeStoreId, disabled, onImageUrlChange, uploadFilesForStore, uploading]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file?.type.startsWith('image/')) return;
      await uploadFile(file);
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled || uploading) return;
      const file = e.dataTransfer.files?.[0];
      if (!file?.type.startsWith('image/')) return;
      await uploadFile(file);
    },
    [disabled, uploadFile, uploading]
  );

  const handleSelect = useCallback(
    (asset: SelectedImageAsset) => {
      onImageUrlChange(asset.url);
      setPickerOpen(false);
    },
    [onImageUrlChange]
  );

  const previewHeight = compact ? 'h-40' : 'h-44';

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {imageUrl ? (
        <div className="space-y-2">
          <div className="relative overflow-hidden rounded-lg border border-gray-200/70 bg-gray-50">
            <img src={imageUrl} alt={imageAlt} className={`${previewHeight} w-full object-cover`} />
            <button
              type="button"
              onClick={() => onImageUrlChange('')}
              disabled={disabled || uploading}
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white transition hover:bg-black/80 disabled:opacity-50"
              aria-label="Remove collection image"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openPicker}
              disabled={disabled || uploading}
              className="text-[13px] font-normal text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Select existing
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              className="text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Upload new'}
            </button>
          </div>
          <p className="text-[12px] text-gray-400">Removing the image here does not delete the file from Content → Files.</p>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="flex min-h-[120px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white px-4 py-6 text-center"
        >
          <PhotoIcon className="h-8 w-8 text-gray-400" />
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={openPicker}
              disabled={disabled || uploading}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Select existing
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Upload new'}
            </button>
          </div>
          <p className="mt-2 max-w-xs text-xs text-gray-500">
            Choose from your store files or upload a new image. Drag and drop also works.
          </p>
        </div>
      )}

      <SelectImageModal open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleSelect} initialUrl={imageUrl} />
    </>
  );
};

export default CollectionCoverImageField;
