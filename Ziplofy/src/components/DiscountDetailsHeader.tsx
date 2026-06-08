import React from "react";
import { ArrowLeftIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

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
  const displayName = method === 'discount-code' ? (discountCode || '—') : (title || '—');
  const statusLabel = (status || 'active').toLowerCase();
  const isActive = statusLabel === 'active';

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="mt-0.5 p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Back to discounts"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate sm:text-xl">
                {displayName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span className="capitalize">{method.replace('-', ' ')}</span>
                <span className="text-gray-300">·</span>
                <span className="font-medium text-gray-700">{value}</span>
                <span className="text-gray-300">·</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 sm:ml-4">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <PencilSquareIcon className="w-4 h-4" />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountDetailsHeader;

