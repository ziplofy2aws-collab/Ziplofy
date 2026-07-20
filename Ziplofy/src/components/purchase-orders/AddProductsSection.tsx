import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import React from 'react';
import {
  productFormCardClass,
  productFormInputClass,
  productFormSectionTitleClass,
} from '../products/product-form-appearance';
import ProductSearchTable from './ProductSearchTable';
import SelectedItemsTable from './SelectedItemsTable';
import { PO_FORM_APPEARANCE, poPrimaryButtonClass } from './purchase-order-ui.util';

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
    onItemsChange(items.map((row, i) => (i === idx ? { ...row, supplierSku: value } : row)));
  };

  const handleQtyChange = (idx: number, value: number) => {
    const next = Math.max(1, value || 1);
    onItemsChange(items.map((row, i) => (i === idx ? { ...row, qty: next } : row)));
  };

  const handleCostChange = (idx: number, value: number) => {
    const next = Math.max(0, value || 0);
    onItemsChange(items.map((row, i) => (i === idx ? { ...row, cost: next } : row)));
  };

  const handleTaxPctChange = (idx: number, value: number) => {
    let next = value;
    if (Number.isNaN(next)) next = 0;
    else next = Math.min(100, Math.max(0, next));
    onItemsChange(items.map((row, i) => (i === idx ? { ...row, taxPct: next } : row)));
  };

  const handleRemoveItem = (idx: number) => {
    onItemsChange(items.filter((_, i) => i !== idx));
  };

  return (
    <section className={productFormCardClass(PO_FORM_APPEARANCE)}>
      <h2 className={productFormSectionTitleClass(PO_FORM_APPEARANCE)}>Products</h2>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search products"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`${productFormInputClass(PO_FORM_APPEARANCE)} pl-9`}
          />
        </div>
        <button
          type="button"
          onClick={onAddSelected}
          disabled={selectedVariantIds.size === 0}
          className={poPrimaryButtonClass}
        >
          Add selected
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
        <ProductSearchTable
          searching={searching}
          results={results}
          selectedVariantIds={selectedVariantIds}
          onVariantToggle={onVariantToggle}
        />
      </div>

      {items.length > 0 ? (
        <div className="mt-5">
          <h3 className="mb-2 text-[13px] font-medium text-gray-600">Selected items</h3>
          <div className="overflow-hidden rounded-lg border border-gray-100">
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
      ) : null}
    </section>
  );
};

export default AddProductsSection;
