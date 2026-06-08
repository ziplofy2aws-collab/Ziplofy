import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import Modal from '../Modal';
import Select from '../Select';

interface AdjustmentRow {
  type: string;
  amount: number;
}

interface SelectOption {
  value: string;
  label: string;
}

interface ManageCostSummaryModalProps {
  open: boolean;
  onClose: () => void;
  adjustmentsRows: AdjustmentRow[];
  onAdjustmentsRowsChange: (rows: AdjustmentRow[]) => void;
  adjustmentTypeOptions: SelectOption[];
}

const ManageCostSummaryModal: React.FC<ManageCostSummaryModalProps> = ({
  open,
  onClose,
  adjustmentsRows,
  onAdjustmentsRowsChange,
  adjustmentTypeOptions,
}) => {
  const handleTypeChange = (idx: number, value: string) => {
    onAdjustmentsRowsChange(adjustmentsRows.map((r, i) => i === idx ? { ...r, type: value } : r));
  };

  const handleAmountChange = (idx: number, value: number) => {
    const n = Number(value) || 0;
    onAdjustmentsRowsChange(adjustmentsRows.map((r, i) => i === idx ? { ...r, amount: n } : r));
  };

  const handleRemove = (idx: number) => {
    onAdjustmentsRowsChange(adjustmentsRows.filter((_, i) => i !== idx));
  };

  const handleAdd = () => {
    onAdjustmentsRowsChange([...adjustmentsRows, { type: 'discount', amount: 0 }]);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manage cost summary"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            Save
          </button>
        </>
      }
    >
      <div className="space-y-3 mt-2">
        {adjustmentsRows.map((row, idx) => (
          <div key={idx} className="flex flex-col md:flex-row gap-3 items-center">
            <div className="flex-1">
              <Select
                label="Adjustment"
                value={idx === 0 ? 'shipping' : row.type}
                options={adjustmentTypeOptions}
                onChange={(v) => handleTypeChange(idx, v)}
                placeholder="Select adjustment"
                disabled={idx === 0}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1.5">
                Amount
              </label>
              <input
                type="number"
                value={row.amount}
                onChange={(e) => handleAmountChange(idx, Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            {idx !== 0 && (
              <button
                onClick={() => handleRemove(idx)}
                className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                aria-label="Remove adjustment"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {adjustmentsRows.length < 8 && (
          <button
            onClick={handleAdd}
            className="w-full px-3 py-1.5 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Add adjustment
          </button>
        )}
      </div>
    </Modal>
  );
};

export default ManageCostSummaryModal;

