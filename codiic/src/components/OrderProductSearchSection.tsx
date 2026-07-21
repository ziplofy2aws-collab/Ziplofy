import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import OrderProductItem, { OrderProductItemData } from './OrderProductItem';

interface OrderProductSearchSectionProps {
  products?: OrderProductItemData[];
  onProductsChange?: (products: OrderProductItemData[]) => void;
  onAddCustomItem?: () => void;
  onBrowse?: () => void;
}

const OrderProductSearchSection: React.FC<OrderProductSearchSectionProps> = ({
  products = [
    {
      id: '1',
      collectionName: 'Collection Name',
      productName: 'Gaming Console',
      variant: 'Medium',
      color: 'Gray',
      colorSwatch: '#9CA3AF',
      quantity: 3,
      unitPrice: 500.0,
      totalPrice: 1500.0,
    },
  ],
  onProductsChange,
  onAddCustomItem,
  onBrowse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // TODO: Implement product search functionality
  }, []);

  const handleQuantityChange = useCallback(
    (id: string, quantity: number) => {
      const updatedProducts = products.map((product) => {
        if (product.id === id) {
          return {
            ...product,
            quantity,
            totalPrice: quantity * product.unitPrice,
          };
        }
        return product;
      });
      if (onProductsChange) {
        onProductsChange(updatedProducts);
      }
    },
    [products, onProductsChange]
  );

  const handleRemove = useCallback(
    (id: string) => {
      const updatedProducts = products.filter((product) => product.id !== id);
      if (onProductsChange) {
        onProductsChange(updatedProducts);
      }
    },
    [products, onProductsChange]
  );

  const handleAddCustomItem = useCallback(() => {
    if (onAddCustomItem) {
      onAddCustomItem();
    } else {
      console.log('Add custom item clicked');
    }
  }, [onAddCustomItem]);

  const handleBrowse = useCallback(() => {
    if (onBrowse) {
      onBrowse();
    } else {
      console.log('Browse clicked');
    }
  }, [onBrowse]);

  // Get current date and time for reservation text
  const getReservationText = useCallback(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    return `Items reserved until today at ${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-200/80">
        <div className="flex items-center justify-between mb-4">
          <div className="pl-3 border-l-4 border-blue-600">
            <h3 className="text-base font-semibold text-gray-900">Products</h3>
            <p className="text-xs text-gray-500 mt-0.5">{getReservationText()}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddCustomItem}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Add custom item
            </button>
            <button
              onClick={handleBrowse}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Browse
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {/* Product List */}
      <div className="px-5 py-4">
        {products.length > 0 ? (
          <div className="space-y-0">
            {products.map((product) => (
              <OrderProductItem
                key={product.id}
                product={product}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500">No products added yet. Search and add products to this order.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderProductSearchSection;

