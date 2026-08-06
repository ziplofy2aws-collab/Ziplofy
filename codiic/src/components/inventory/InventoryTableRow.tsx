import { RectangleStackIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { InventoryLevel } from '../../contexts/inventory-level.contexts';
import {
  inventoryInputClass,
  inventoryPrimaryButtonClass,
  inventorySecondaryButtonClass,
  inventoryStickyCheckboxCellClass,
  inventoryStickyProductCellClass,
} from './inventory-ui.util';

type InventoryTableRowProps = {
  level: InventoryLevel;
  isSelected: boolean;
  onSelect: (levelId: string, checked: boolean) => void;
  onOpenUnavailable: (event: React.MouseEvent<HTMLElement>, levelId: string) => void;
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
};

function getUnavailableTotal(level: InventoryLevel): number {
  const { damaged, qualityControl, safetyStock, other } = level.unavailable;
  return damaged + qualityControl + safetyStock + other;
}

function getProductImageUrl(level: InventoryLevel): string | null {
  return level.variantId.images?.[0] || level.variantId.productId.imageUrls?.[0] || null;
}

function getOptionSummary(level: InventoryLevel): string {
  return Object.values(level.variantId.optionValues || {}).join(' / ');
}

const InventoryTableRow: React.FC<InventoryTableRowProps> = ({
  level,
  isSelected,
  onSelect,
  onOpenUnavailable,
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
}) => {
  const imageUrl = getProductImageUrl(level);
  const optionSummary = getOptionSummary(level);
  const unavailableTotal = getUnavailableTotal(level);
  const sku = level.variantId.sku?.trim() || 'No SKU';

  return (
    <tr
      className={`group border-b border-admin-divider transition-colors last:border-b-0 ${
        isSelected ? 'bg-admin-row-hover' : 'bg-admin-surface hover:bg-admin-row-hover'
      }`}
    >
      <td className={`${inventoryStickyCheckboxCellClass}${isSelected ? ' !bg-admin-row-hover' : ''}`}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(level._id, e.target.checked)}
          aria-label={`Select ${level.variantId.productId.title}`}
          className="h-3.5 w-3.5 cursor-pointer rounded border-[#8c9196] text-admin-text focus:ring-[#005bd3]/30"
        />
      </td>
      <td className={`${inventoryStickyProductCellClass}${isSelected ? ' !bg-admin-row-hover' : ''}`}>
        <div className="flex min-w-[220px] items-center gap-3">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border border-admin-border bg-admin-secondary">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-admin-secondary">
                <RectangleStackIcon className="h-4 w-4 text-admin-text-subdued" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-admin-text">{level.variantId.productId.title}</p>
            {optionSummary ? (
              <p className="truncate text-[12px] text-admin-text-secondary">{optionSummary}</p>
            ) : null}
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5">
        <span className="text-[13px] font-normal text-admin-text-secondary">{sku}</span>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-right">
        <button
          type="button"
          onClick={(e) => onOpenUnavailable(e, level._id)}
          className="text-[13px] font-normal text-admin-text-secondary underline decoration-dotted decoration-admin-text-subdued underline-offset-2 transition-colors hover:text-admin-text"
        >
          {unavailableTotal}
        </button>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-right">
        <span className="text-[13px] font-normal text-admin-text-secondary">{level.committed}</span>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-right">
        {editingAvailableId === level._id ? (
          <div className="inline-flex items-center justify-end gap-1.5">
            <input
              type="number"
              min="0"
              value={editAvailableValue}
              onChange={(e) => onEditAvailableChange(Number(e.target.value) || 0)}
              className={`${inventoryInputClass} w-16 text-right`}
            />
            <button type="button" onClick={onCancelEditAvailable} disabled={savingAvailable} className={inventorySecondaryButtonClass}>
              Cancel
            </button>
            <button type="button" onClick={onSaveAvailable} disabled={savingAvailable} className={inventoryPrimaryButtonClass}>
              {savingAvailable ? '…' : 'Save'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onStartEditAvailable(level._id, level.available)}
            className="text-[13px] font-normal text-admin-text-secondary transition-colors hover:text-admin-text"
          >
            {level.available}
          </button>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-right">
        {editingOnHandId === level._id ? (
          <div className="inline-flex items-center justify-end gap-1.5">
            <input
              type="number"
              min="0"
              value={editOnHandValue}
              onChange={(e) => onEditOnHandChange(Number(e.target.value) || 0)}
              className={`${inventoryInputClass} w-16 text-right`}
            />
            <button type="button" onClick={onCancelEditOnHand} disabled={savingOnHand} className={inventorySecondaryButtonClass}>
              Cancel
            </button>
            <button type="button" onClick={onSaveOnHand} disabled={savingOnHand} className={inventoryPrimaryButtonClass}>
              {savingOnHand ? '…' : 'Save'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onStartEditOnHand(level._id, level.onHand)}
            className="text-[13px] font-normal text-admin-text-secondary transition-colors hover:text-admin-text"
          >
            {level.onHand}
          </button>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-right">
        <span className="text-[13px] font-normal text-admin-text-secondary">{level.incoming ?? 0}</span>
      </td>
    </tr>
  );
};

export default InventoryTableRow;
