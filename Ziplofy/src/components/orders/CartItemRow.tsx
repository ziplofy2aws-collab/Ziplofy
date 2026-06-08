import React from 'react';

interface CartItem {
  _id: string;
  productVariant: {
    images?: string[];
    sku: string;
    price: number;
    optionValues: Record<string, string>;
  };
  quantity: number;
}

interface CartItemRowProps {
  item: CartItem;
}

const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {item.productVariant.images && item.productVariant.images.length > 0 && (
            <img
              src={item.productVariant.images[0]}
              alt={item.productVariant.sku}
              className="w-10 h-10 object-cover rounded"
            />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {Object.entries(item.productVariant.optionValues)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <p className="text-sm text-gray-600">{item.productVariant.sku}</p>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right">
        <p className="text-sm font-medium text-gray-900">${item.productVariant.price}</p>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {item.quantity}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right">
        <p className="text-sm font-semibold text-gray-900">
          ${(item.productVariant.price * item.quantity).toFixed(2)}
        </p>
      </td>
    </tr>
  );
};

export default CartItemRow;

