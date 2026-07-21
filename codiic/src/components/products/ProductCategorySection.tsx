import React from "react";
import HierarchicalCategoryDropdown from "../HierarchicalCategoryDropdown";
import {
  type ProductFormAppearance,
  productFormCardClass,
  productFormHelperTextClass,
  productFormSectionTitleClass,
} from "./product-form-appearance";

interface ProductCategorySectionProps {
  category: string;
  categoryName?: string;
  activeStoreId: string | null;
  onCategoryChange: (categoryId: string) => void;
  appearance?: ProductFormAppearance;
}

const ProductCategorySection: React.FC<ProductCategorySectionProps> = ({
  category,
  categoryName,
  activeStoreId,
  onCategoryChange,
  appearance = 'default',
}) => {
  return (
    <div className={productFormCardClass(appearance)}>
      <h2 className={productFormSectionTitleClass(appearance)}>Category</h2>
      <HierarchicalCategoryDropdown
        selectedCategory={category}
        selectedCategoryName={categoryName}
        onCategorySelect={(categoryId) => {
          onCategoryChange(categoryId);
        }}
        storeId={activeStoreId || ""}
        appearance={appearance}
      />
      <p className={productFormHelperTextClass(appearance)}>
        Determines tax rates and adds metafields to improve search, filters, and cross-channel sales
      </p>
    </div>
  );
};

export default ProductCategorySection;
