import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '../Modal';
import {
  buildOrdersCsv,
  downloadCsvFile,
  filterOrdersByDateRange,
  type OrderCsvFormat,
} from './export-orders.util';
import type { OrderTableRowData } from './orders-table.types';

export type ExportScope =
  | 'current-page'
  | 'all-orders'
  | 'selected'
  | 'search-matching'
  | 'by-date';

type ExportOrdersModalProps = {
  open: boolean;
  onClose: () => void;
  allOrders: OrderTableRowData[];
  currentPageOrders: OrderTableRowData[];
  searchMatchingOrders: OrderTableRowData[];
  selectedOrderIds: Set<string>;
  searchQuery: string;
};

function RadioOption({
  name,
  value,
  checked,
  disabled,
  label,
  onChange,
}: {
  name: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2.5 rounded-md py-1.5 ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-300 disabled:cursor-not-allowed"
      />
      <span className="text-[13px] text-gray-800">{label}</span>
    </label>
  );
}

const ExportOrdersModal: React.FC<ExportOrdersModalProps> = ({
  open,
  onClose,
  allOrders,
  currentPageOrders,
  searchMatchingOrders,
  selectedOrderIds,
  searchQuery,
}) => {
  const selectedCount = selectedOrderIds.size;
  const searchCount = searchMatchingOrders.length;
  const hasSearch = searchQuery.trim().length > 0;

  const [exportScope, setExportScope] = useState<ExportScope>('all-orders');
  const [exportFormat, setExportFormat] = useState<OrderCsvFormat>('excel');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!open) return;
    if (selectedCount > 0) {
      setExportScope('selected');
      return;
    }
    if (hasSearch && searchCount > 0) {
      setExportScope('search-matching');
      return;
    }
    setExportScope('all-orders');
  }, [open, selectedCount, hasSearch, searchCount]);

  const resolveOrdersForExport = useMemo((): OrderTableRowData[] => {
    switch (exportScope) {
      case 'current-page':
        return currentPageOrders;
      case 'all-orders':
        return allOrders;
      case 'selected':
        return allOrders.filter((order) => selectedOrderIds.has(order.orderId));
      case 'search-matching':
        return searchMatchingOrders;
      case 'by-date':
        return filterOrdersByDateRange(allOrders, startDate, endDate);
      default:
        return allOrders;
    }
  }, [
    exportScope,
    allOrders,
    currentPageOrders,
    searchMatchingOrders,
    selectedOrderIds,
    startDate,
    endDate,
  ]);

  const handleExportOrders = () => {
    if (resolveOrdersForExport.length === 0) {
      toast.error('No orders to export');
      return;
    }
    const csv = buildOrdersCsv(resolveOrdersForExport, exportFormat);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsvFile(csv, `orders-export-${stamp}.csv`);
    toast.success(`Exported ${resolveOrdersForExport.length} order${resolveOrdersForExport.length === 1 ? '' : 's'}`);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export orders"
      maxWidth="md"
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExportOrders}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
          >
            <ArrowUpTrayIcon className="h-4 w-4" aria-hidden />
            Export orders
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <section>
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Export</h3>
          <div className="space-y-0.5">
            <RadioOption
              name="export-scope"
              value="current-page"
              checked={exportScope === 'current-page'}
              label="Current page"
              onChange={(value) => setExportScope(value as ExportScope)}
            />
            <RadioOption
              name="export-scope"
              value="all-orders"
              checked={exportScope === 'all-orders'}
              label="All orders"
              onChange={(value) => setExportScope(value as ExportScope)}
            />
            <RadioOption
              name="export-scope"
              value="selected"
              checked={exportScope === 'selected'}
              disabled={selectedCount === 0}
              label={`Selected: ${selectedCount} order${selectedCount === 1 ? '' : 's'}`}
              onChange={(value) => setExportScope(value as ExportScope)}
            />
            <RadioOption
              name="export-scope"
              value="search-matching"
              checked={exportScope === 'search-matching'}
              disabled={!hasSearch || searchCount === 0}
              label={`${searchCount} order${searchCount === 1 ? '' : 's'} matching your search`}
              onChange={(value) => setExportScope(value as ExportScope)}
            />
            <RadioOption
              name="export-scope"
              value="by-date"
              checked={exportScope === 'by-date'}
              label="Orders by date"
              onChange={(value) => setExportScope(value as ExportScope)}
            />
          </div>

          {exportScope === 'by-date' ? (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-gray-600">Start date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-[13px] text-gray-700 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-gray-600">End date</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-[13px] text-gray-700 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
                />
              </label>
            </div>
          ) : null}
        </section>

        <section>
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Export as</h3>
          <div className="space-y-0.5">
            <RadioOption
              name="export-format"
              value="excel"
              checked={exportFormat === 'excel'}
              label="CSV for Excel, Numbers, or other spreadsheet programs"
              onChange={(value) => setExportFormat(value as OrderCsvFormat)}
            />
            <RadioOption
              name="export-format"
              value="plain"
              checked={exportFormat === 'plain'}
              label="Plain CSV file"
              onChange={(value) => setExportFormat(value as OrderCsvFormat)}
            />
          </div>
        </section>
      </div>
    </Modal>
  );
};

export default ExportOrdersModal;
