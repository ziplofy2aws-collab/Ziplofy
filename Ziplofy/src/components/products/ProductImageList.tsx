import React from "react";
import ProductImageItem from "./ProductImageItem";

interface ProductImageListProps {
  images: string[];
  onRemoveImage: (index: number) => void;
}

const ProductImageList: React.FC<ProductImageListProps> = ({
  images,
  onRemoveImage,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {images.map((imageUrl, index) => (
        <ProductImageItem
          key={index}
          imageUrl={imageUrl}
          index={index}
          onRemoveImage={onRemoveImage}
        />
      ))}
    </div>
  );
};

export default ProductImageList;

