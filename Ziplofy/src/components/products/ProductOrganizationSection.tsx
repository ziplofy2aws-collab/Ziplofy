import React, { useCallback } from "react";
import { useProductTags } from "../../contexts/product-tags.context";
import ProductTagsInput from "./ProductTagsInput";
import ProductTypeInput from "./ProductTypeInput";
import SelectedTagsList from "./SelectedTagsList";
import VendorInput from "./VendorInput";

interface ProductOrganizationSectionProps {
  productType: string;
  vendor: string;
  tags: string[];
  onProductTypeChange: (productTypeId: string) => void;
  onVendorChange: (vendorId: string) => void;
  onTagsChange: (tags: string[]) => void;
  activeStoreId: string | null;
}

const ProductOrganizationSection: React.FC<ProductOrganizationSectionProps> = ({
  productType,
  vendor,
  tags,
  onProductTypeChange,
  onVendorChange,
  onTagsChange,
  activeStoreId,
}) => {
  const { productTags } = useProductTags();

  const handleTagRemove = useCallback((tagId: string) => {
    onTagsChange(tags.filter(x => x !== tagId));
  }, [tags, onTagsChange]);

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-7 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-5">
        Product Organization
      </h2>
      
      <div className="space-y-5">
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

      <div className="mt-6">
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

