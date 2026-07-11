import React, { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { useStore } from "../../contexts/store.context";
import {
  defaultContentFilesFolder,
  useStoreCloudStorage,
} from "../../contexts/store-cloud-storage.context";
import { uploadImagesToCloudStorage } from "../../hooks/useProductMediaUrls";
import {
  SelectImageModal,
  type SelectedImageAsset,
} from "../SelectImageModal";
import ProductImageList from "./ProductImageList";
import {
  type ProductFormAppearance,
  productFormCardClass,
  productFormSectionTitleClass,
} from "./product-form-appearance";

interface ProductImagesSectionProps {
  images: string[];
  onAddImageUrl: (url: string) => void;
  onRemoveImage: (index: number) => void;
  disabled?: boolean;
  /** Omit outer card + border when nested inside another section (e.g. Basic Information). */
  embedded?: boolean;
  appearance?: ProductFormAppearance;
}

const ProductImagesSection: React.FC<ProductImagesSectionProps> = ({
  images,
  onAddImageUrl,
  onRemoveImage,
  disabled = false,
  embedded = false,
  appearance = 'default',
}) => {
  const { activeStoreId } = useStore();
  const { uploadFilesForStore } = useStoreCloudStorage();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadFilesToCloud = useCallback(
    async (files: File[]) => {
      if (disabled || uploading) return;
      if (!activeStoreId) {
        toast.error('Select a store before uploading files');
        return;
      }
      setUploading(true);
      try {
        const urls = await uploadImagesToCloudStorage(
          activeStoreId,
          files,
          (storeId, imageFiles, options) =>
            uploadFilesForStore(storeId, imageFiles, {
              folder: options?.folder ?? defaultContentFilesFolder(storeId),
            })
        );
        urls.forEach((url) => onAddImageUrl(url));
      } catch {
        // toast shown in helper
      } finally {
        setUploading(false);
      }
    },
    [activeStoreId, disabled, onAddImageUrl, uploadFilesForStore, uploading]
  );

  const handlePickImages = useCallback(() => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  }, [disabled, uploading]);

  const handleOpenPicker = useCallback(() => {
    if (disabled || uploading) return;
    if (!activeStoreId) {
      toast.error('Select a store before choosing files');
      return;
    }
    setPickerOpen(true);
  }, [activeStoreId, disabled, uploading]);

  const handleFileSelection = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      e.target.value = "";
      if (!files.length) return;
      void uploadFilesToCloud(files);
    },
    [uploadFilesToCloud]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !uploading) setIsDragOver(true);
    },
    [disabled, uploading]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (disabled || uploading) return;
      const files = Array.from(e.dataTransfer.files);
      if (files.length) void uploadFilesToCloud(files);
    },
    [disabled, uploadFilesToCloud, uploading]
  );

  const handleCloudImageSelected = useCallback(
    (asset: SelectedImageAsset) => {
      onAddImageUrl(asset.url);
      setPickerOpen(false);
    },
    [onAddImageUrl]
  );

  const mediaTitleClass = productFormSectionTitleClass(appearance);
  const dropZoneClass =
    appearance === 'minimal'
      ? disabled || uploading
        ? "cursor-not-allowed border-gray-200/60 bg-gray-50/40 opacity-60"
        : isDragOver
          ? "border-gray-300 bg-gray-50"
          : "border-gray-200/70 bg-white"
      : disabled || uploading
        ? "cursor-not-allowed border-gray-200 bg-gray-50/50 opacity-60"
        : isDragOver
          ? "border-blue-400 bg-blue-50/40"
          : "border-gray-200 bg-white";

  const actionButtonClass =
    appearance === 'minimal'
      ? 'rounded-md border border-gray-200/70 bg-white px-3.5 py-1.5 text-sm font-normal text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
      : 'rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50';

  const body = (
    <>
      {!embedded ? (
        <h2 className={mediaTitleClass}>Media</h2>
      ) : (
        <h3 className={mediaTitleClass}>Media</h3>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelection}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex min-h-[200px] flex-col rounded-md border border-dashed px-4 py-4 transition-colors ${dropZoneClass}`}
      >
        {images.length > 0 ? (
          <div className="mb-4 max-h-[300px] w-full overflow-y-auto pr-1">
            <ProductImageList images={images} onRemoveImage={onRemoveImage} />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center" />
        )}

        <div className="mt-auto flex w-full flex-col items-center justify-center gap-2 pb-2 pt-1">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handlePickImages}
              disabled={disabled || uploading}
              className={actionButtonClass}
            >
              {uploading ? 'Uploading…' : 'Upload new'}
            </button>
            <button
              type="button"
              onClick={handleOpenPicker}
              disabled={disabled || uploading}
              className={actionButtonClass}
            >
              Select existing
            </button>
          </div>
          <p className={`max-w-md text-center ${appearance === 'minimal' ? 'text-[13px] text-gray-400' : 'text-sm text-gray-500'}`}>
            Images are chosen from your store files. Removing media here does not delete the file.
          </p>
        </div>
      </div>

      <SelectImageModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleCloudImageSelected}
      />
    </>
  );

  if (embedded) {
    return <div>{body}</div>;
  }

  return (
    <div className={productFormCardClass(appearance)}>
      {body}
    </div>
  );
};

export default ProductImagesSection;
