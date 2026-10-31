import React, { useCallback } from "react";
import { ProductType } from "../../contexts/product-type.context";

interface ProductTypeItemProps {
  productType: ProductType;
  onSelect: (productType: ProductType) => void;
}

const ProductTypeItem: React.FC<ProductTypeItemProps> = ({
  productType,
  onSelect,
}) => {
  const handleClick = useCallback(() => {
    onSelect(productType);
  }, [productType, onSelect]);

  return (
    <div
      className="cursor-pointer px-3 py-2 text-[13px] text-gray-700 transition-colors hover:bg-gray-50"
      onClick={handleClick}
    >
      {productType.name}
    </div>
  );
};

export default ProductTypeItem;

