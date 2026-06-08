import React from 'react';
import SelectedItemsTableBody from './SelectedItemsTableBody';

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

interface SelectedItemsTableProps {
  items: ProductItem[];
  onSupplierSkuChange: (idx: number, value: string) => void;
  onQtyChange: (idx: number, value: number) => void;
  onCostChange: (idx: number, value: number) => void;
  onTaxPctChange: (idx: number, value: number) => void;
  onRemove: (idx: number) => void;
}

const SelectedItemsTable: React.FC<SelectedItemsTableProps> = ({
  items,
  onSupplierSkuChange,
  onQtyChange,
  onCostChange,
  onTaxPctChange,
  onRemove,
}) => {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-white">
        <tr>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Product</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Supplier SKU</th>
          <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Qty</th>
          <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Cost</th>
          <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Tax %</th>
          <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Total</th>
          <th className="px-4 py-2 text-right text-sm font-medium text-gray-900"></th>
        </tr>
      </thead>
      <SelectedItemsTableBody
        items={items}
        onSupplierSkuChange={onSupplierSkuChange}
        onQtyChange={onQtyChange}
        onCostChange={onCostChange}
        onTaxPctChange={onTaxPctChange}
        onRemove={onRemove}
      />
    </table>
  );
};

export default SelectedItemsTable;

