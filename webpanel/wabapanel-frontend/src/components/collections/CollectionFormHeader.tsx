import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React from 'react';

type CollectionFormHeaderProps = {
  mode: 'create' | 'edit';
  title: string;
  status?: 'draft' | 'published';
  submitLabel: string;
  submitDisabled?: boolean;
  backLabel?: string;
  onBack?: () => void;
  onCancel?: () => void;
  onSubmit: () => void;
};

const CollectionFormHeader: React.FC<CollectionFormHeaderProps> = ({
  mode,
  title,
  status,
  submitLabel,
  submitDisabled = false,
  backLabel = 'Back to collections',
  onBack,
  onCancel,
  onSubmit,
}) => {
  const heading = mode === 'create' ? 'Create collection' : title || 'Collection';

  return (
    <div className="mb-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mb-3 flex items-center gap-2 text-sm font-normal text-gray-400 transition-colors hover:text-gray-600"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          {backLabel}
        </button>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-lg font-medium tracking-tight text-gray-800">{heading}</h1>
          {mode === 'edit' && status ? (
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                status === 'published'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {status === 'published' ? 'Published' : 'Draft'}
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-200/60 bg-white px-3 py-2 text-sm font-normal text-gray-600 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
          ) : null}
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitDisabled}
            className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionFormHeader;
