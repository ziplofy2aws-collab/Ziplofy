import React, { useCallback, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import ProductImageList from "./ProductImageList";

interface ProductImagesSectionProps {
  images: string[];
  onAddImageFiles: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
  disabled?: boolean;
  /** Omit outer card + border when nested inside another section (e.g. Basic Information). */
  embedded?: boolean;
}

const ProductImagesSection: React.FC<ProductImagesSectionProps> = ({
  images,
  onAddImageFiles,
  onRemoveImage,
  disabled = false,
  embedded = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const addImageFilesFromList = useCallback(
    (files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      const rejected = files.length - imageFiles.length;
      if (rejected > 0) {
        toast.error(
          "Only images are supported for product media right now."
        );
      }
      if (imageFiles.length > 0) {
        onAddImageFiles(imageFiles);
      }
    },
    [onAddImageFiles]
  );

  const handlePickImages = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  const handleFileSelection = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      e.target.value = "";
      if (!files.length) return;
      addImageFilesFromList(files);
    },
    [addImageFilesFromList]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
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
      if (disabled) return;
      const files = Array.from(e.dataTransfer.files);
      if (files.length) addImageFilesFromList(files);
    },
    [disabled, addImageFilesFromList]
  );

  const body = (
    <>
      {!embedded ? (
        <h2 className="mb-4 text-base font-semibold text-gray-900">Media</h2>
      ) : (
        <h3 className="mb-4 text-base font-semibold text-gray-900">Media</h3>
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
        className={`flex min-h-[220px] flex-col rounded-lg border-2 border-dashed px-4 py-4 transition-colors ${
          disabled
            ? "cursor-not-allowed border-gray-200 bg-gray-50/50 opacity-60"
            : isDragOver
              ? "border-blue-400 bg-blue-50/40"
              : "border-gray-200 bg-white"
        }`}
      >
        {images.length > 0 ? (
          <div className="mb-4 max-h-[300px] w-full overflow-y-auto pr-1">
            <ProductImageList images={images} onRemoveImage={onRemoveImage} />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center" />
        )}

        <div className="mt-auto flex w-full flex-col items-center justify-center pb-2 pt-1">
        <button
          type="button"
          onClick={handlePickImages}
          disabled={disabled}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Upload new
        </button>
        <p className="mt-4 max-w-md text-center text-sm text-gray-500">
          Accepts images, videos, or 3D models
        </p>
        </div>
      </div>
    </>
  );

  if (embedded) {
    return <div>{body}</div>;
  }

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
      {body}
    </div>
  );
};

export default ProductImagesSection;
