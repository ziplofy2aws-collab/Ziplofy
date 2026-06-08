import React from 'react';

interface ProductTableHeaderRowProps {
  productImage?: string;
  productTitle: string;
}

const ProductTableHeaderRow: React.FC<ProductTableHeaderRowProps> = ({
  productImage,
  productTitle,
}) => {
  return (
    <tr className="bg-white">
      <td colSpan={2} className="px-4 py-2">
        <div className="flex items-center gap-2">
          {productImage ? (
            <img
              src={productImage}
              alt={productTitle || 'Product'}
              className="w-8 h-8 object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200"></div>
          )}
          <span className="text-sm font-medium text-gray-900">{productTitle || 'Unnamed product'}</span>
        </div>
      </td>
    </tr>
  );
};

export default ProductTableHeaderRow;

