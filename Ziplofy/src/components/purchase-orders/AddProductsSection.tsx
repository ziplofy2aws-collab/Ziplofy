import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import React from 'react';
import ProductSearchTable from './ProductSearchTable';
import SelectedItemsTable from './SelectedItemsTable';

interface ProductItem {
  variantId: string;
  productTitle: string;
  productImage?: string;
  variantLabel: string;
  variantSku?: string;
  supplierSku: string;
  qty: number;
  cost: number;
  taxPct: number;
}

interface AddProductsSectionProps {
  search: string;
  onSearchChange: (value: string) => void;
  searching: boolean;
  results: any[];
  selectedVariantIds: Set<string>;
  onVariantToggle: (variantId: string) => void;
  onAddSelected: () => void;
  items: ProductItem[];
  onItemsChange: (items: ProductItem[]) => void;
}

const AddProductsSection: React.FC<AddProductsSectionProps> = ({
  search,
  onSearchChange,
  searching,
  results,
  selectedVariantIds,
  onVariantToggle,
  onAddSelected,
  items,
  onItemsChange,
}) => {
  const handleSupplierSkuChange = (idx: number, value: string) => {
    onItemsChange(items.map((r, i) => i === idx ? { ...r, supplierSku: value } : r));
  };

  const handleQtyChange = (idx: number, value: number) => {
    const n = Math.max(1, value || 1);
    onItemsChange(items.map((r, i) => i === idx ? { ...r, qty: n } : r));
  };

  const handleCostChange = (idx: number, value: number) => {
    const n = Math.max(0, value || 0);
    onItemsChange(items.map((r, i) => i === idx ? { ...r, cost: n } : r));
  };

  const handleTaxPctChange = (idx: number, value: number) => {
    let n = value;
    if (isNaN(n)) n = 0; else n = Math.min(100, Math.max(0, n));
    onItemsChange(items.map((r, i) => i === idx ? { ...r, taxPct: n } : r));
  };

  const handleRemoveItem = (idx: number) => {
    onItemsChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="border border-gray-200 p-4 bg-white/95">
      <h2 className="text-base font-medium text-gray-900 mb-3">Add products</h2>
      <input
        type="text"
        placeholder="Search products"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 mb-3 focus:outline-none focus:ring-1 focus:ring-gray-400"
      />
      <div className="flex justify-end mb-2">
        <button
          onClick={onAddSelected}
          disabled={selectedVariantIds.size === 0}
          className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Add selected
        </button>
      </div>
      <div className="border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <ProductSearchTable
            searching={searching}
            results={results}
            selectedVariantIds={selectedVariantIds}
            onVariantToggle={onVariantToggle}
          />
        </div>
      </div>

      {/* Added items table */}
      {items.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Selected items</h3>
          <div className="border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <SelectedItemsTable
                items={items}
                onSupplierSkuChange={handleSupplierSkuChange}
                onQtyChange={handleQtyChange}
                onCostChange={handleCostChange}
                onTaxPctChange={handleTaxPctChange}
                onRemove={handleRemoveItem}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProductsSection;

