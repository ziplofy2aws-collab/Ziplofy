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
      className="px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={handleClick}
    >
      {productType.name}
    </div>
  );
};

export default ProductTypeItem;

