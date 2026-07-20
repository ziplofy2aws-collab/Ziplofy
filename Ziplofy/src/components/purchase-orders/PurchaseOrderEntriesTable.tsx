import { RectangleStackIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { PurchaseOrderEntryDoc } from '../../contexts/purchase-order-entry.context';
import { poTableCellClass, poTableCellRightClass, poTableHeadClass, poTableHeadRightClass } from './purchase-order-ui.util';

type PurchaseOrderEntriesTableProps = {
  entries: PurchaseOrderEntryDoc[];
  loading?: boolean;
};

const PurchaseOrderEntriesTable: React.FC<PurchaseOrderEntriesTableProps> = ({ entries, loading }) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className={poTableHeadClass}>Product</th>
              <th className={poTableHeadClass}>Supplier SKU</th>
              <th className={poTableHeadClass}>SKU</th>
              <th className={poTableHeadRightClass}>Quantity</th>
              <th className={poTableHeadRightClass}>Cost</th>
              <th className={poTableHeadRightClass}>Tax %</th>
              <th className={poTableHeadRightClass}>Total</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {loading ? (
              <tr>
                <td colSpan={7} className={`${poTableCellClass} py-10 text-center text-gray-500`}>
                  Loading products…
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={7} className={`${poTableCellClass} py-10 text-center text-gray-500`}>
                  No products
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const variant = entry.variantId as any;
                const productTitle = variant?.productId?.title || '—';
                const optionText = variant?.optionValues
                  ? Object.values(variant.optionValues).join(' / ')
                  : '';
                const imageUrl = variant?.images?.[0] || variant?.productId?.imageUrls?.[0];

                return (
                  <tr key={entry._id} className="border-b border-gray-100">
                    <td className={poTableCellClass}>
                      <div className="flex min-w-[200px] items-center gap-3">
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                          {imageUrl ? (
                            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                              <RectangleStackIcon className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-gray-900">{productTitle}</p>
                          {optionText ? (
                            <p className="truncate text-[12px] text-gray-500">{optionText}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className={poTableCellClass}>{entry.supplierSku || '—'}</td>
                    <td className={poTableCellClass}>{variant?.sku || 'No SKU'}</td>
                    <td className={poTableCellRightClass}>{entry.quantityOrdered}</td>
                    <td className={poTableCellRightClass}>{entry.cost.toFixed(2)}</td>
                    <td className={poTableCellRightClass}>{(entry.taxPercent ?? 0).toFixed(0)}</td>
                    <td className={`${poTableCellRightClass} font-medium text-gray-900`}>
                      {entry.totalCost.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrderEntriesTable;
