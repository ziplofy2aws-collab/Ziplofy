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
        className="mb-3 flex items-center gap-2 text-[13px] font-medium text-[#005bd3] transition-colors hover:underline"
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden />
        Back to discounts
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-admin-text">{displayName}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-admin-text-secondary">
            <span className="capitalize">{method.replace('-', ' ')}</span>
            <span className="text-admin-text-subdued">·</span>
            <span className="font-medium text-admin-text">{value}</span>
            <span className="text-admin-text-subdued">·</span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                isActive ? 'bg-[#cdfee1] text-[#0c5132]' : 'bg-[#fef3d0] text-[#6b5500]'
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
