import { RectangleStackIcon, TrashIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { productFormInputClass } from '../products/product-form-appearance';
import { poTableCellClass, poTableCellRightClass } from './purchase-order-ui.util';

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
  const inputClass = `${productFormInputClass('minimal')} py-1.5`;

  return (
    <tr className="border-b border-gray-100">
      <td className={poTableCellClass}>
        <div className="flex min-w-[200px] items-center gap-3">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
            {item.productImage ? (
              <img src={item.productImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <RectangleStackIcon className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-gray-900">{item.productTitle}</p>
            <p className="truncate text-[12px] text-gray-500">
              {item.variantLabel} • {item.variantSku || 'No SKU'}
            </p>
          </div>
        </div>
      </td>
      <td className={poTableCellClass}>
        <input
          type="text"
          placeholder="Supplier SKU"
          value={item.supplierSku}
          onChange={(e) => onSupplierSkuChange(index, e.target.value)}
          className={`${inputClass} min-w-[120px]`}
        />
      </td>
      <td className={poTableCellRightClass}>
        <input
          type="number"
          min={1}
          value={item.qty}
          onChange={(e) => onQtyChange(index, Number(e.target.value) || 1)}
          className={`${inputClass} w-20 text-right`}
        />
      </td>
      <td className={poTableCellRightClass}>
        <input
          type="number"
          min={0}
          step="0.01"
          value={item.cost}
          onChange={(e) => onCostChange(index, Number(e.target.value) || 0)}
          className={`${inputClass} w-24 text-right`}
        />
      </td>
      <td className={poTableCellRightClass}>
        <input
          type="number"
          min={0}
          max={100}
          step="0.01"
          value={item.taxPct}
          onChange={(e) => onTaxPctChange(index, Number(e.target.value))}
          className={`${inputClass} w-20 text-right`}
        />
      </td>
      <td className={`${poTableCellRightClass} font-medium text-gray-900`}>{lineTotal.toFixed(2)}</td>
      <td className="px-3 py-2.5 text-right">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Remove item"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
};

export default SelectedItemTableRow;
