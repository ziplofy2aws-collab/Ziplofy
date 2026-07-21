import React from 'react';
import SelectedItemsTableBody from './SelectedItemsTableBody';
import { poTableHeadClass, poTableHeadRightClass } from './purchase-order-ui.util';

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
    <table className="w-full min-w-[760px] text-left">
      <thead>
        <tr className="border-b border-gray-100 bg-gray-50/50">
          <th className={poTableHeadClass}>Product</th>
          <th className={poTableHeadClass}>Supplier SKU</th>
          <th className={poTableHeadRightClass}>Qty</th>
          <th className={poTableHeadRightClass}>Cost</th>
          <th className={poTableHeadRightClass}>Tax %</th>
          <th className={poTableHeadRightClass}>Total</th>
          <th className="w-10 px-3 py-2.5" />
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
