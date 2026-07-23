import React, { useCallback } from "react";
import { useProductTags } from "../../contexts/product-tags.context";
import ProductTagsInput from "./ProductTagsInput";
import ProductTypeInput from "./ProductTypeInput";
import SelectedTagsList from "./SelectedTagsList";
import VendorInput from "./VendorInput";
import {
  type ProductFormAppearance,
  productFormCardClass,
  productFormSectionTitleClass,
} from "./product-form-appearance";

interface ProductOrganizationSectionProps {
  productType: string;
  vendor: string;
  tags: string[];
  onProductTypeChange: (productTypeId: string) => void;
  onVendorChange: (vendorId: string) => void;
  onTagsChange: (tags: string[]) => void;
  activeStoreId: string | null;
  appearance?: ProductFormAppearance;
}

const ProductOrganizationSection: React.FC<ProductOrganizationSectionProps> = ({
  productType,
  vendor,
  tags,
  onProductTypeChange,
  onVendorChange,
  onTagsChange,
  activeStoreId,
  appearance = 'default',
}) => {
  const { productTags } = useProductTags();

  const handleTagRemove = useCallback((tagId: string) => {
    onTagsChange(tags.filter(x => x !== tagId));
  }, [tags, onTagsChange]);

  return (
    <div className={productFormCardClass(appearance)}>
      <h2 className={productFormSectionTitleClass(appearance)}>
        {appearance === 'minimal' ? 'Organization' : 'Product Organization'}
      </h2>
      {appearance === 'minimal' ? (
        <p className="-mt-1 mb-3 text-[12px] leading-snug text-gray-400">
          Type, vendor, and tags help you find this later
        </p>
      ) : null}

      <div className={appearance === 'minimal' ? 'space-y-4' : 'space-y-5'}>
        <ProductTypeInput
          selectedProductTypeId={productType}
          activeStoreId={activeStoreId}
          onProductTypeChange={onProductTypeChange}
        />
        <VendorInput
          selectedVendorId={vendor}
          activeStoreId={activeStoreId}
          onVendorChange={onVendorChange}
        />
      </div>

      <div className={appearance === 'minimal' ? 'mt-5' : 'mt-6'}>
        <ProductTagsInput
          selectedTags={tags}
          activeStoreId={activeStoreId}
          onTagsChange={onTagsChange}
        />
        <SelectedTagsList
          tagIds={tags}
          productTags={productTags}
          onTagRemove={handleTagRemove}
        />
      </div>
    </div>
  );
};

export default ProductOrganizationSection;
