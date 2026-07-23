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
  hideTitle?: boolean;
}

const ProductCategorySection: React.FC<ProductCategorySectionProps> = ({
  category,
  categoryName,
  activeStoreId,
  onCategoryChange,
  appearance = 'default',
  hideTitle = false,
}) => {
  return (
    <div className={productFormCardClass(appearance)}>
      {!hideTitle ? (
        <h2 className={productFormSectionTitleClass(appearance)}>Category</h2>
      ) : null}
      <HierarchicalCategoryDropdown
        selectedCategory={category}
        selectedCategoryName={categoryName}
        onCategorySelect={(categoryId) => {
          onCategoryChange(categoryId);
        }}
        storeId={activeStoreId || ''}
        inline
        defaultOpen
      />
      <p className={productFormHelperTextClass(appearance)}>
        Used for taxes, filters, and helping customers find this product
      </p>
    </div>
  );
};

export default ProductCategorySection;
