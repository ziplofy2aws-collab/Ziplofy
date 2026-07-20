import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { InventoryLevel } from '../../contexts/inventory-level.contexts';
import {
  inventoryColumnHeaderClass,
  inventoryColumnHeaderWithHintClass,
} from './inventory-ui.util';
import InventoryTableRow from './InventoryTableRow';

const COLUMN_HINTS = {
  unavailable: 'Inventory that is not available to sell, such as damaged or safety stock.',
  committed: 'Units reserved for unfulfilled orders.',
  available: 'Units ready to sell.',
  onHand: 'Total physical inventory at this location.',
  incoming: 'Units expected from transfers or purchase orders.',
} as const;

type InventoryTableProps = {
  levels: InventoryLevel[];
  editingAvailableId: string | null;
  editAvailableValue: number;
  savingAvailable: boolean;
  onStartEditAvailable: (levelId: string, current: number) => void;
  onCancelEditAvailable: () => void;
  onSaveAvailable: () => void;
  onEditAvailableChange: (value: number) => void;
  editingOnHandId: string | null;
  editOnHandValue: number;
  savingOnHand: boolean;
  onStartEditOnHand: (levelId: string, current: number) => void;
  onCancelEditOnHand: () => void;
  onSaveOnHand: () => void;
  onEditOnHandChange: (value: number) => void;
  onOpenUnavailable: (event: React.MouseEvent<HTMLElement>, levelId: string) => void;
};

const InventoryTable: React.FC<InventoryTableProps> = ({
  levels,
  editingAvailableId,
  editAvailableValue,
  savingAvailable,
  onStartEditAvailable,
  onCancelEditAvailable,
  onSaveAvailable,
  onEditAvailableChange,
  editingOnHandId,
  editOnHandValue,
  savingOnHand,
  onStartEditOnHand,
  onCancelEditOnHand,
  onSaveOnHand,
  onEditOnHandChange,
  onOpenUnavailable,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const visibleIds = useMemo(() => levels.map((level) => level._id), [levels]);
  const selectedVisibleCount = useMemo(
    () => visibleIds.filter((id) => selectedIds.has(id)).length,
    [visibleIds, selectedIds]
  );
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected]);

  const handleSelectRow = (levelId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(levelId);
      else next.delete(levelId);
      return next;
    });
  };

  const handleSelectAllVisible = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        visibleIds.forEach((id) => next.add(id));
      } else {
        visibleIds.forEach((id) => next.delete(id));
      }
      return next;
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="w-10 px-3 py-2.5 text-center">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(e) => handleSelectAllVisible(e.target.checked)}
                aria-label="Select all inventory items"
                className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-gray-900 focus:ring-gray-300"
              />
            </th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Product</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">SKU</th>
            <th className={inventoryColumnHeaderWithHintClass} title={COLUMN_HINTS.unavailable}>
              Unavailable
            </th>
            <th className={inventoryColumnHeaderWithHintClass} title={COLUMN_HINTS.committed}>
              Committed
            </th>
            <th className={inventoryColumnHeaderWithHintClass} title={COLUMN_HINTS.available}>
              Available
            </th>
            <th className={inventoryColumnHeaderWithHintClass} title={COLUMN_HINTS.onHand}>
              On hand
            </th>
            <th className={inventoryColumnHeaderClass} title={COLUMN_HINTS.incoming}>
              Incoming
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {levels.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-3 py-16 text-center">
                <p className="text-[15px] font-semibold text-gray-900">No inventory found</p>
                <p className="mt-1.5 text-[13px] font-normal text-gray-500">
                  Try changing the location or search term
                </p>
              </td>
            </tr>
          ) : (
            levels.map((level) => (
              <InventoryTableRow
                key={level._id}
                level={level}
                isSelected={selectedIds.has(level._id)}
                onSelect={handleSelectRow}
                onOpenUnavailable={onOpenUnavailable}
                editingAvailableId={editingAvailableId}
                editAvailableValue={editAvailableValue}
                savingAvailable={savingAvailable}
                onStartEditAvailable={onStartEditAvailable}
                onCancelEditAvailable={onCancelEditAvailable}
                onSaveAvailable={onSaveAvailable}
                onEditAvailableChange={onEditAvailableChange}
                editingOnHandId={editingOnHandId}
                editOnHandValue={editOnHandValue}
                savingOnHand={savingOnHand}
                onStartEditOnHand={onStartEditOnHand}
                onCancelEditOnHand={onCancelEditOnHand}
                onSaveOnHand={onSaveOnHand}
                onEditOnHandChange={onEditOnHandChange}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
