import React from 'react';
import SelectedItemTableRow from './SelectedItemTableRow';

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

interface SelectedItemsTableBodyProps {
  items: ProductItem[];
  onSupplierSkuChange: (idx: number, value: string) => void;
  onQtyChange: (idx: number, value: number) => void;
  onCostChange: (idx: number, value: number) => void;
  onTaxPctChange: (idx: number, value: number) => void;
  onRemove: (idx: number) => void;
}

const SelectedItemsTableBody: React.FC<SelectedItemsTableBodyProps> = ({
  items,
  onSupplierSkuChange,
  onQtyChange,
  onCostChange,
  onTaxPctChange,
  onRemove,
}) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {items.map((row, idx) => (
        <SelectedItemTableRow
          key={row.variantId}
          item={row}
          index={idx}
          onSupplierSkuChange={onSupplierSkuChange}
          onQtyChange={onQtyChange}
          onCostChange={onCostChange}
          onTaxPctChange={onTaxPctChange}
          onRemove={onRemove}
        />
      ))}
    </tbody>
  );
};

export default SelectedItemsTableBody;

