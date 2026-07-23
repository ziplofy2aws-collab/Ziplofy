import { ArrowLeftIcon, ChevronDownIcon, CubeIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useRef, useState } from 'react';
import type { ProductFormAppearance } from './product-form-appearance';

type ProductFormHeaderProps = {
  mode: 'create' | 'edit';
  title: string;
  status?: 'active' | 'draft';
  isDeleted?: boolean;
  submitLabel: string;
  submitDisabled?: boolean;
  backLabel?: string;
  onBack?: () => void;
  onSubmit: () => void;
  onCancel?: () => void;
  onDeleteProduct?: () => void;
  onUndeleteProduct?: () => void;
  onDuplicate?: () => void;
  duplicateDisabled?: boolean;
  duplicateLabel?: string;
  appearance?: ProductFormAppearance;
  /** Hide the header primary action when a sticky/footer submit is used instead. */
  hideSubmit?: boolean;
};

const ProductFormHeader: React.FC<ProductFormHeaderProps> = ({
  mode,
  title,
  status,
  isDeleted = false,
  submitLabel,
  submitDisabled = false,
  backLabel = 'Back to Products',
  onBack,
  onSubmit,
  onCancel,
  onDeleteProduct,
  onUndeleteProduct,
  onDuplicate,
  duplicateDisabled = false,
  duplicateLabel = 'Duplicate',
  appearance = 'default',
  hideSubmit = false,
}) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const isMinimal = appearance === 'minimal';

  useEffect(() => {
    if (!moreOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreOpen]);

  const heading = mode === 'create' ? 'Add product' : title;

  const secondaryButtonClass = isMinimal
    ? 'rounded-md border border-gray-200/60 bg-white px-3 py-2 text-sm font-normal text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
    : 'rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50';

  const submitButtonClass = isMinimal
    ? 'inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50'
    : 'inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className={isMinimal ? 'mb-4' : 'mb-5'}>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className={`mb-3 flex items-center gap-2 text-sm transition-colors ${
            isMinimal
              ? 'font-normal text-gray-400 hover:text-gray-600'
              : 'font-medium text-gray-500 hover:text-gray-900'
          }`}
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          {backLabel}
        </button>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {!isMinimal ? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100">
              <CubeIcon className="h-4 w-4 text-gray-700" aria-hidden />
            </div>
          ) : null}
          <h1
            className={`truncate tracking-tight text-gray-800 ${
              isMinimal
                ? 'text-lg font-medium'
                : 'text-xl font-semibold text-gray-900 sm:text-2xl'
            }`}
          >
            {heading}
          </h1>
          {mode === 'edit' && status ? (
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                status === 'active'
                  ? isMinimal
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-emerald-100 text-emerald-800'
                  : isMinimal
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              {status === 'active' ? 'Active' : 'Draft'}
            </span>
          ) : null}
          {isDeleted ? (
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                isMinimal ? 'bg-red-50 text-red-600' : 'bg-red-100 text-red-700'
              }`}
            >
              Deleted
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {onCancel ? (
            <button type="button" onClick={onCancel} className={secondaryButtonClass}>
              Cancel
            </button>
          ) : null}

          {mode === 'edit' && onDuplicate ? (
            <button
              type="button"
              onClick={onDuplicate}
              disabled={duplicateDisabled}
              className={secondaryButtonClass}
            >
              {duplicateLabel}
            </button>
          ) : null}

          {mode === 'edit' && (onDeleteProduct || onUndeleteProduct) ? (
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1 ${secondaryButtonClass}`}
              >
                More actions
                <ChevronDownIcon className="h-4 w-4 text-gray-400" aria-hidden />
              </button>
              {moreOpen ? (
                <div className={`absolute right-0 top-full z-30 mt-1 min-w-[180px] rounded-lg border bg-white py-1 ${
                  isMinimal ? 'border-gray-200/60 shadow-md' : 'border-gray-200 shadow-lg'
                }`}>
                  {isDeleted ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMoreOpen(false);
                        onUndeleteProduct?.();
                      }}
                      className="flex w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Un-delete product
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMoreOpen(false);
                        onDeleteProduct?.();
                      }}
                      className="flex w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete product
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          {hideSubmit ? null : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitDisabled}
              className={submitButtonClass}
            >
              {submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFormHeader;
