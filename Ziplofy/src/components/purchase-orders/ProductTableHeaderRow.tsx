import React from 'react';
import { RectangleStackIcon } from '@heroicons/react/24/outline';
import { poTableCellClass } from './purchase-order-ui.util';

interface ProductTableHeaderRowProps {
  productImage?: string;
  productTitle: string;
}

const ProductTableHeaderRow: React.FC<ProductTableHeaderRowProps> = ({
  productImage,
  productTitle,
}) => {
  return (
    <tr className="border-b border-gray-100 bg-gray-50/30">
      <td colSpan={2} className={poTableCellClass}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
            {productImage ? (
              <img src={productImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <RectangleStackIcon className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>
          <span className="text-[13px] font-medium text-gray-900">{productTitle || 'Unnamed product'}</span>
        </div>
      </td>
    </tr>
  );
};

export default ProductTableHeaderRow;
