import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

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

interface SelectedItemTableRowProps {
  item: ProductItem;
  index: number;
  onSupplierSkuChange: (idx: number, value: string) => void;
  onQtyChange: (idx: number, value: number) => void;
  onCostChange: (idx: number, value: number) => void;
  onTaxPctChange: (idx: number, value: number) => void;
  onRemove: (idx: number) => void;
}

const SelectedItemTableRow: React.FC<SelectedItemTableRowProps> = ({
  item,
  index,
  onSupplierSkuChange,
  onQtyChange,
  onCostChange,
  onTaxPctChange,
  onRemove,
}) => {
  const lineTotal = (item.qty || 0) * (item.cost || 0) * (1 + (item.taxPct || 0) / 100);

  return (
    <tr>
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          {item.productImage ? (
            <img
              src={item.productImage}
              alt={item.productTitle}
              className="w-8 h-8 object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200"></div>
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{item.productTitle}</div>
            <div className="text-xs text-gray-600">{item.variantLabel} • {item.variantSku || '-'}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-2">
        <input
          type="text"
          placeholder="Supplier SKU"
          value={item.supplierSku}
          onChange={(e) => onSupplierSkuChange(index, e.target.value)}
          className="px-2 py-1 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </td>
      <td className="px-4 py-2 text-right">
        <input
          type="number"
          min={1}
          value={item.qty}
          onChange={(e) => onQtyChange(index, Number(e.target.value) || 1)}
          className="w-[90px] px-2 py-1 text-sm border border-gray-200 text-right focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </td>
      <td className="px-4 py-2 text-right">
        <input
          type="number"
          min={0}
          step="0.01"
          value={item.cost}
          onChange={(e) => onCostChange(index, Number(e.target.value) || 0)}
          className="w-[110px] px-2 py-1 text-sm border border-gray-200 text-right focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </td>
      <td className="px-4 py-2 text-right">
        <input
          type="number"
          min={0}
          max={100}
          step="0.01"
          value={item.taxPct}
          onChange={(e) => onTaxPctChange(index, Number(e.target.value))}
          className="w-[100px] px-2 py-1 text-sm border border-gray-200 text-right focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </td>
      <td className="px-4 py-2 text-right text-sm text-gray-900">{lineTotal.toFixed(2)}</td>
      <td className="px-4 py-2 text-right">
        <button
          onClick={() => onRemove(index)}
          className="p-1 text-gray-600 hover:text-red-600 transition-colors"
          aria-label="Remove"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

export default SelectedItemTableRow;

