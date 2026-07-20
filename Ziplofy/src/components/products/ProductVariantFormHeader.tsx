import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { ProductFormAppearance } from './product-form-appearance';

type ProductVariantFormHeaderProps = {
  title: string;
  productTitle: string;
  submitLabel: string;
  submitDisabled?: boolean;
  onBack: () => void;
  onSubmit: () => void;
  appearance?: ProductFormAppearance;
};

const ProductVariantFormHeader: React.FC<ProductVariantFormHeaderProps> = ({
  title,
  productTitle,
  submitLabel,
  submitDisabled = false,
  onBack,
  onSubmit,
  appearance = 'default',
}) => {
  const isMinimal = appearance === 'minimal';

  return (
    <div className={isMinimal ? 'mb-4' : 'mb-5'}>
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
        Back to product
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1
            className={`truncate tracking-tight text-gray-800 ${
              isMinimal ? 'text-lg font-medium' : 'text-xl font-semibold text-gray-900 sm:text-2xl'
            }`}
          >
            {title}
          </h1>
          <p className={`mt-0.5 truncate ${isMinimal ? 'text-[13px] text-gray-400' : 'text-sm text-gray-500'}`}>
            {productTitle}
          </p>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={submitDisabled}
          className={
            isMinimal
              ? 'inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50'
              : 'inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
          }
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
};

export default ProductVariantFormHeader;
