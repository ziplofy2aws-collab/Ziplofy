import React, { useCallback, useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { useStore } from "../../contexts/store.context";
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
  /** Omit outer card + title when nested inside another section (e.g. Basic Information). */
  embedded?: boolean;
  appearance?: ProductFormAppearance;
}

const ProductImagesSection: React.FC<ProductImagesSectionProps> = ({
  images,
  onAddImageUrl,
  onRemoveImage,
  disabled = false,
  embedded = false,
  appearance = "default",
}) => {
  const { activeStoreId } = useStore();
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleOpenPicker = useCallback(() => {
    if (disabled) return;
    if (!activeStoreId) {
      toast.error("Select a store before choosing files");
      return;
    }
    setPickerOpen(true);
  }, [activeStoreId, disabled]);

  const handleZoneKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleOpenPicker();
      }
    },
    [handleOpenPicker]
  );

  const handleCloudImageSelected = useCallback(
    (asset: SelectedImageAsset) => {
      onAddImageUrl(asset.url);
      setPickerOpen(false);
    },
    [onAddImageUrl]
  );

  const mediaTitleClass = productFormSectionTitleClass(appearance);
  const isMinimal = appearance === "minimal";

  const dropZoneClass = disabled
    ? isMinimal
      ? "cursor-not-allowed border-gray-200/60 bg-gray-50/40 opacity-60"
      : "cursor-not-allowed border-gray-200 bg-gray-50/50 opacity-60"
    : isMinimal
      ? "cursor-pointer border-gray-300 bg-gray-50/50"
      : "cursor-pointer border-gray-300 bg-gray-50/40";

  const body = (
    <>
      {!embedded ? (
        <h2 className={mediaTitleClass}>Media</h2>
      ) : (
        <h3 className={mediaTitleClass}>Media</h3>
      )}

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label={images.length > 0 ? "Add more product images" : "Select product images"}
        onClick={handleOpenPicker}
        onKeyDown={handleZoneKeyDown}
        className={`flex min-h-[200px] w-full flex-col rounded-md border border-dashed px-4 py-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 ${dropZoneClass}`}
      >
        {images.length > 0 ? (
          <div
            className="mb-2 max-h-[300px] w-full overflow-y-auto pr-1"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <ProductImageList images={images} onRemoveImage={onRemoveImage} />
          </div>
        ) : null}

        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 pointer-events-none">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isMinimal ? "bg-gray-100 text-gray-400" : "bg-gray-100 text-gray-500"
            }`}
          >
            <PhotoIcon className="h-5 w-5" aria-hidden />
          </span>
          <p
            className={`text-center font-medium ${
              isMinimal ? "text-[13px] text-gray-700" : "text-sm text-gray-800"
            }`}
          >
            {images.length > 0 ? "Add more images" : "Select images"}
          </p>
          <p
            className={`max-w-sm text-center ${
              isMinimal ? "text-[12px] text-gray-400" : "text-sm text-gray-500"
            }`}
          >
            Click anywhere to choose from your store files
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

  return <div className={productFormCardClass(appearance)}>{body}</div>;
};

export default ProductImagesSection;
