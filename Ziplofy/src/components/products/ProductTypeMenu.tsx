import React, { useCallback } from "react";
import { ProductType } from "../../contexts/product-type.context";
import ProductTypeList from "./ProductTypeList";

interface ProductTypeMenuProps {
  productTypes: ProductType[];
  debouncedQuery: string;
  queryExists: boolean;
  onProductTypeSelect: (productType: ProductType) => void;
  onCreateProductType: () => void;
}

const ProductTypeMenu: React.FC<ProductTypeMenuProps> = ({
  productTypes,
  debouncedQuery,
  queryExists,
  onProductTypeSelect,
  onCreateProductType,
}) => {
  const handleMenuMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 max-h-72 overflow-y-auto shadow-lg"
      onMouseDown={handleMenuMouseDown}
    >
      <ProductTypeList
        productTypes={productTypes}
        onProductTypeSelect={onProductTypeSelect}
      />
      {debouncedQuery && !queryExists && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={onCreateProductType}
        >
          <span className="font-medium text-gray-800">{`+ ${debouncedQuery}`}</span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Tap to create
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductTypeMenu;

