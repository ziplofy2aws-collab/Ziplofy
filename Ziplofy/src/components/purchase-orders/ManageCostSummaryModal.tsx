import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import Modal from '../Modal';
import Select from '../Select';
import { productFormInputClass } from '../products/product-form-appearance';
import { poPrimaryButtonClass, poSecondaryButtonClass } from './purchase-order-ui.util';

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
    onAdjustmentsRowsChange(adjustmentsRows.map((row, i) => (i === idx ? { ...row, type: value } : row)));
  };

  const handleAmountChange = (idx: number, value: number) => {
    const next = Number(value) || 0;
    onAdjustmentsRowsChange(adjustmentsRows.map((row, i) => (i === idx ? { ...row, amount: next } : row)));
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
          <button type="button" onClick={onClose} className={poSecondaryButtonClass}>
            Cancel
          </button>
          <button type="button" onClick={onClose} className={poPrimaryButtonClass}>
            Save
          </button>
        </>
      }
    >
      <div className="mt-2 space-y-3">
        {adjustmentsRows.map((row, idx) => (
          <div key={idx} className="flex flex-col items-center gap-3 md:flex-row">
            <div className="flex-1">
              <Select
                label="Adjustment"
                value={idx === 0 ? 'shipping' : row.type}
                options={adjustmentTypeOptions}
                onChange={(value) => handleTypeChange(idx, value)}
                placeholder="Select adjustment"
                disabled={idx === 0}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-normal text-gray-500">Amount</label>
              <input
                type="number"
                value={row.amount}
                onChange={(e) => handleAmountChange(idx, Number(e.target.value))}
                className={productFormInputClass('minimal')}
              />
            </div>
            {idx !== 0 ? (
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600"
                aria-label="Remove adjustment"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        ))}
        {adjustmentsRows.length < 8 ? (
          <button type="button" onClick={handleAdd} className={`w-full ${poSecondaryButtonClass}`}>
            Add adjustment
          </button>
        ) : null}
      </div>
    </Modal>
  );
};

export default ManageCostSummaryModal;
