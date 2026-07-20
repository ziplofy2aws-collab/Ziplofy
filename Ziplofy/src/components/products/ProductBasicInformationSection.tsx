import React from "react";
import ProductDescriptionInput from "./ProductDescriptionInput";
import ProductImagesSection from "./ProductImagesSection";
import ProductTitleInput from "./ProductTitleInput";
import {
  type ProductFormAppearance,
  productFormCardClass,
  productFormDividerClass,
  productFormSectionTitleClass,
} from "./product-form-appearance";

interface ProductBasicInformationSectionProps {
  title: string;
  description: string;
  images: string[];
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAddImageUrl: (url: string) => void;
  onRemoveImage: (index: number) => void;
  mediaDisabled?: boolean;
  appearance?: ProductFormAppearance;
}

const ProductBasicInformationSection: React.FC<
  ProductBasicInformationSectionProps
> = ({
  title,
  description,
  images,
  onTitleChange,
  onDescriptionChange,
  onAddImageUrl,
  onRemoveImage,
  mediaDisabled = false,
  appearance = 'default',
}) => {
  return (
    <div className={productFormCardClass(appearance)}>
      <h2 className={productFormSectionTitleClass(appearance)}>
        Basic Information
      </h2>

      <div className={appearance === 'minimal' ? 'space-y-3' : 'space-y-4'}>
        <ProductTitleInput
          value={title}
          onChange={onTitleChange}
          required
          appearance={appearance}
        />

        <ProductDescriptionInput
          value={description}
          onChange={onDescriptionChange}
        />
      </div>

      <div className={productFormDividerClass(appearance)}>
        <ProductImagesSection
          embedded
          images={images}
          onAddImageUrl={onAddImageUrl}
          onRemoveImage={onRemoveImage}
          disabled={mediaDisabled}
          appearance={appearance}
        />
      </div>
    </div>
  );
};

export default ProductBasicInformationSection;
