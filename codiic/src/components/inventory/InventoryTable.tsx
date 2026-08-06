import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { InventoryLevel } from '../../contexts/inventory-level.contexts';
import { adminListTableHeadRowClass } from '../admin-list-ui';
import {
  inventoryColumnHeaderClass,
  inventoryColumnHeaderWithHintClass,
} from './inventory-ui.util';
import InventoryTableRow from './InventoryTableRow';
import { InventoryTableSkeletonRows } from './InventoryTableSkeleton';

const COLUMN_HINTS = {
  unavailable: 'Inventory that is not available to sell, such as damaged or safety stock.',
  committed: 'Units reserved for unfulfilled orders.',
  available: 'Units ready to sell.',
  onHand: 'Total physical inventory at this location.',
  incoming: 'Units expected from transfers or purchase orders.',
} as const;

type InventoryTableProps = {
  levels: InventoryLevel[];
  loading?: boolean;
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
  loading = false,
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
    <div className="min-h-0 flex-1 overflow-auto bg-admin-surface">
      <table className="w-full min-w-[920px] border-separate border-spacing-0 text-left">
        <thead>
          <tr className={adminListTableHeadRowClass}>
            <th className="sticky left-0 top-0 z-30 w-10 border-b border-admin-border bg-admin-table-header px-3 py-2 text-center">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(e) => handleSelectAllVisible(e.target.checked)}
                disabled={loading}
                aria-label="Select all inventory items"
                className="h-3.5 w-3.5 cursor-pointer rounded border-[#8c9196] text-admin-text focus:ring-[#005bd3]/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </th>
            <th className="sticky left-10 top-0 z-30 border-b border-admin-border bg-admin-table-header px-3 py-2 text-left text-[12px] font-medium leading-5 text-[#616161] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
              Product
            </th>
            <th className="sticky top-0 z-20 border-b border-admin-border bg-admin-table-header px-3 py-2 text-left text-[12px] font-medium leading-5 text-[#616161]">
              SKU
            </th>
            <th
              className={`sticky top-0 z-20 border-b border-admin-border bg-admin-table-header ${inventoryColumnHeaderWithHintClass}`}
              title={COLUMN_HINTS.unavailable}
            >
              Unavailable
            </th>
            <th
              className={`sticky top-0 z-20 border-b border-admin-border bg-admin-table-header ${inventoryColumnHeaderWithHintClass}`}
              title={COLUMN_HINTS.committed}
            >
              Committed
            </th>
            <th
              className={`sticky top-0 z-20 border-b border-admin-border bg-admin-table-header ${inventoryColumnHeaderWithHintClass}`}
              title={COLUMN_HINTS.available}
            >
              Available
            </th>
            <th
              className={`sticky top-0 z-20 border-b border-admin-border bg-admin-table-header ${inventoryColumnHeaderWithHintClass}`}
              title={COLUMN_HINTS.onHand}
            >
              On hand
            </th>
            <th
              className={`sticky top-0 z-20 border-b border-admin-border bg-admin-table-header ${inventoryColumnHeaderClass}`}
              title={COLUMN_HINTS.incoming}
            >
              Incoming
            </th>
          </tr>
        </thead>
        <tbody className="bg-admin-surface">
          {loading ? (
            <InventoryTableSkeletonRows />
          ) : levels.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-3 py-16 text-center">
                <p className="text-[15px] font-semibold text-admin-text">No inventory found</p>
                <p className="mt-1.5 text-[13px] font-normal text-admin-text-secondary">
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
