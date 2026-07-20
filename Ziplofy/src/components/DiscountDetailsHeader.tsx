import { ArrowLeftIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import React from 'react';
import {
  discountDangerButtonClass,
  discountSecondaryButtonClass,
} from './discounts/discount-ui.util';

interface DiscountDetailsHeaderProps {
  method: string;
  discountCode?: string;
  title?: string;
  value: string;
  status?: string;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const DiscountDetailsHeader: React.FC<DiscountDetailsHeaderProps> = ({
  method,
  discountCode,
  title,
  value,
  status,
  onBack,
  onEdit,
  onDelete,
}) => {
  const displayName = method === 'discount-code' ? discountCode || '—' : title || '—';
  const statusLabel = (status || 'active').toLowerCase();
  const isActive = statusLabel === 'active';

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 flex items-center gap-2 text-sm font-normal text-gray-400 transition-colors hover:text-gray-600"
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden />
        Back to discounts
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-gray-900">{displayName}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-gray-500">
            <span className="capitalize">{method.replace('-', ' ')}</span>
            <span className="text-gray-300">·</span>
            <span className="font-medium text-gray-700">{value}</span>
            <span className="text-gray-300">·</span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {onEdit ? (
            <button type="button" onClick={onEdit} className={discountSecondaryButtonClass}>
              <PencilSquareIcon className="mr-1.5 h-4 w-4" aria-hidden />
              Edit
            </button>
          ) : null}
          {onDelete ? (
            <button type="button" onClick={onDelete} className={discountDangerButtonClass}>
              <TrashIcon className="mr-1.5 h-4 w-4" aria-hidden />
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DiscountDetailsHeader;
