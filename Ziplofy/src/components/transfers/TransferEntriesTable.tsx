import { RectangleStackIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { TransferEntryDoc } from '../../contexts/transfer-entries.context';
import {
  transferTableCellClass,
  transferTableCellRightClass,
  transferTableHeadClass,
  transferTableHeadRightClass,
} from './transfer-ui.util';

type TransferEntriesTableProps = {
  entries: TransferEntryDoc[];
  loading?: boolean;
};

const TransferEntriesTable: React.FC<TransferEntriesTableProps> = ({ entries, loading }) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className={transferTableHeadClass}>Product</th>
              <th className={transferTableHeadClass}>SKU</th>
              <th className={transferTableHeadRightClass}>At origin</th>
              <th className={transferTableHeadRightClass}>Quantity</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {loading ? (
              <tr>
                <td colSpan={4} className={`${transferTableCellClass} py-10 text-center text-gray-500`}>
                  Loading products…
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={4} className={`${transferTableCellClass} py-10 text-center text-gray-500`}>
                  No products in this transfer
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const optionText = entry.variantId.optionValues
                  ? Object.values(entry.variantId.optionValues).join(' / ')
                  : '';
                const imageUrl = entry.variantId.images?.[0];

                return (
                  <tr key={entry._id} className="border-b border-gray-100">
                    <td className={transferTableCellClass}>
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
                          <p className="truncate text-[13px] font-medium text-gray-900">
                            {entry.variantId.productName || 'Unnamed product'}
                          </p>
                          {optionText ? (
                            <p className="truncate text-[12px] text-gray-500">{optionText}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className={transferTableCellClass}>{entry.variantId.sku || 'No SKU'}</td>
                    <td className={transferTableCellRightClass}>
                      {typeof (entry as { atOrigin?: number }).atOrigin === 'number'
                        ? (entry as { atOrigin: number }).atOrigin
                        : 0}
                    </td>
                    <td className={`${transferTableCellRightClass} font-medium text-gray-900`}>
                      {entry.quantity}
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

export default TransferEntriesTable;
