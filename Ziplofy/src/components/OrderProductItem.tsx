import { TrashIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';

export interface OrderProductItemData {
  id: string;
  collectionName?: string;
  productName: string;
  variant?: string;
  color?: string;
  colorSwatch?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderProductItemProps {
  product: OrderProductItemData;
  onQuantityChange?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
}

const OrderProductItem: React.FC<OrderProductItemProps> = ({
  product,
  onQuantityChange,
  onRemove,
}) => {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuantity = parseInt(e.target.value, 10) || 1;
      if (newQuantity > 0 && onQuantityChange) {
        onQuantityChange(product.id, newQuantity);
      }
    },
    [product.id, onQuantityChange]
  );

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove(product.id);
    }
  }, [product.id, onRemove]);

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-page-background-color/50 transition-colors -mx-5 px-5">
      {/* Left Side: Product Info */}
      <div className="flex-1">
        {product.collectionName && (
          <p className="text-xs text-gray-500 mb-1">{product.collectionName}</p>
        )}
        <h4 className="text-sm font-semibold text-gray-900 mb-1">{product.productName}</h4>
        <div className="flex items-center gap-2">
          {product.variant && (
            <span className="text-xs text-gray-600">{product.variant}</span>
          )}
          {product.color && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-600">{product.color}</span>
              {product.colorSwatch && (
                <div
                  className="w-3 h-3 rounded border border-gray-300"
                  style={{ backgroundColor: product.colorSwatch }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Quantity, Price, and Delete */}
      <div className="flex items-center gap-4">
        {/* Quantity and Unit Price Button */}
        <button
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '1';
            input.value = product.quantity.toString();
            // TODO: Implement quantity selector modal or inline edit
          }}
          className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
        >
          {product.quantity} × {formatCurrency(product.unitPrice)}
        </button>

        {/* Total Price */}
        <span className="text-sm font-semibold text-gray-900 w-24 text-right">
          {formatCurrency(product.totalPrice)}
        </span>

        {/* Delete Button */}
        <button
          onClick={handleRemove}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Remove product"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default OrderProductItem;

