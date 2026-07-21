import React from "react";
import { ProductType } from "../../contexts/product-type.context";
import ProductTypeItem from "./ProductTypeItem";

interface ProductTypeListProps {
  productTypes: ProductType[];
  onProductTypeSelect: (productType: ProductType) => void;
}

const ProductTypeList: React.FC<ProductTypeListProps> = ({
  productTypes,
  onProductTypeSelect,
}) => {
  return (
    <>
      {productTypes.map(pt => (
        <ProductTypeItem
          key={pt._id}
          productType={pt}
          onSelect={onProductTypeSelect}
        />
      ))}
    </>
  );
};

export default ProductTypeList;

