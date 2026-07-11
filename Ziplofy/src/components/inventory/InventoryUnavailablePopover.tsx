import React from 'react';
import { inventoryInputClass, inventoryPrimaryButtonClass, inventorySecondaryButtonClass } from './inventory-ui.util';

type UnavailableBreakdown = {
  damaged: number;
  qualityControl: number;
  safetyStock: number;
  other: number;
};

type InventoryUnavailablePopoverProps = {
  anchorEl: HTMLElement;
  values: UnavailableBreakdown;
  saving: boolean;
  onChange: (key: keyof UnavailableBreakdown, value: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

const InventoryUnavailablePopover: React.FC<InventoryUnavailablePopoverProps> = ({
  anchorEl,
  values,
  saving,
  onChange,
  onCancel,
  onSave,
}) => {
  const rect = anchorEl.getBoundingClientRect();

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onCancel} />
      <div
        className="fixed z-50 rounded-lg border border-gray-200 bg-white shadow-lg"
        style={{
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-100 px-3 py-2">
          <p className="text-[12px] font-medium text-gray-700">Unavailable inventory</p>
        </div>
        <div className="min-w-[240px] py-1">
          {(
            [
              ['damaged', 'Damaged'],
              ['qualityControl', 'Quality control'],
              ['safetyStock', 'Safety stock'],
              ['other', 'Other'],
            ] as const
          ).map(([key, label]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 px-3 py-2 hover:bg-gray-50/80"
            >
              <span className="text-[13px] text-gray-700">{label}</span>
              <input
                type="number"
                min="0"
                value={values[key]}
                onChange={(e) => onChange(key, e.target.value)}
                className={`${inventoryInputClass} w-20`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-3 py-2">
          <button type="button" onClick={onCancel} disabled={saving} className={inventorySecondaryButtonClass}>
            Cancel
          </button>
          <button type="button" onClick={onSave} disabled={saving} className={inventoryPrimaryButtonClass}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </>
  );
};

export default InventoryUnavailablePopover;
