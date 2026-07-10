import React from "react";
import HierarchicalCategoryDropdown from "../HierarchicalCategoryDropdown";
import ProductDescriptionInput from "./ProductDescriptionInput";
import ProductImagesSection from "./ProductImagesSection";
import ProductTitleInput from "./ProductTitleInput";

interface ProductBasicInformationSectionProps {
  title: string;
  description: string;
  category: string;
  activeStoreId: string | null;
  images: string[];
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onAddImageFiles: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
  mediaDisabled?: boolean;
}

const ProductBasicInformationSection: React.FC<
  ProductBasicInformationSectionProps
> = ({
  title,
  description,
  category,
  activeStoreId,
  images,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onAddImageFiles,
  onRemoveImage,
  mediaDisabled = false,
}) => {
  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">
        Basic Information
      </h2>

      <div className="space-y-4">
        <ProductTitleInput
          value={title}
          onChange={onTitleChange}
          required
        />

        <ProductDescriptionInput
          value={description}
          onChange={onDescriptionChange}
        />
      </div>

      <div className="mt-6 border-t border-gray-100 pt-6">
        <ProductImagesSection
          embedded
          images={images}
          onAddImageFiles={onAddImageFiles}
          onRemoveImage={onRemoveImage}
          disabled={mediaDisabled}
        />
      </div>

      <div className="mt-6 border-t border-gray-100 pt-6">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Category</h3>
        <HierarchicalCategoryDropdown
          selectedCategory={category}
          onCategorySelect={(categoryId) => {
            onCategoryChange(categoryId);
          }}
          storeId={activeStoreId || ""}
        />
      </div>
    </div>
  );
};

export default ProductBasicInformationSection;
