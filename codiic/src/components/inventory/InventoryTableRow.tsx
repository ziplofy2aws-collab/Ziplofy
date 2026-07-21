import { RectangleStackIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { InventoryLevel } from '../../contexts/inventory-level.contexts';
import {
  inventoryInputClass,
  inventoryPrimaryButtonClass,
  inventorySecondaryButtonClass,
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
    <tr className="border-b border-gray-100 transition-colors hover:bg-gray-50/60">
      <td className="w-10 px-3 py-2.5 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(level._id, e.target.checked)}
          aria-label={`Select ${level.variantId.productId.title}`}
          className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-gray-900 focus:ring-gray-300"
        />
      </td>
      <td className="px-3 py-2.5">
        <div className="flex min-w-[220px] items-center gap-3">
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
            <p className="truncate text-[13px] font-medium text-gray-900">{level.variantId.productId.title}</p>
            {optionSummary ? <p className="truncate text-[12px] text-gray-500">{optionSummary}</p> : null}
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <span className="text-[13px] text-gray-700">{sku}</span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <button
          type="button"
          onClick={(e) => onOpenUnavailable(e, level._id)}
          className="text-[13px] text-gray-700 underline decoration-dotted underline-offset-2 transition-colors hover:text-gray-900"
        >
          {unavailableTotal}
        </button>
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="text-[13px] text-gray-700">{level.committed}</span>
      </td>
      <td className="px-3 py-2.5 text-right">
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
            className="text-[13px] text-gray-700 transition-colors hover:text-gray-900"
          >
            {level.available}
          </button>
        )}
      </td>
      <td className="px-3 py-2.5 text-right">
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
            className="text-[13px] text-gray-700 transition-colors hover:text-gray-900"
          >
            {level.onHand}
          </button>
        )}
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="text-[13px] text-gray-700">{level.incoming ?? 0}</span>
      </td>
    </tr>
  );
};

export default InventoryTableRow;
