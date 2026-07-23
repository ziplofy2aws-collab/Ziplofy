import {
  PlusIcon,
  SwatchIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useMemo } from 'react';
import {
  type ProductFormAppearance,
  productFormCardClass,
  productFormInputClass,
  productFormLabelClass,
} from './product-form-appearance';

export type ProductVariantOption = {
  optionName: string;
  values: string[];
};

type ProductVariantsSectionProps = {
  variants: ProductVariantOption[];
  onAddVariant: () => void;
  onRemoveVariant: (index: number) => void;
  onUpdateOptionName: (index: number, name: string) => void;
  onSetValues: (index: number, values: string[]) => void;
  appearance?: ProductFormAppearance;
};

function filledValues(values: string[]): string[] {
  return values.map((v) => v.trim()).filter(Boolean);
}

function VariantValueEditor({
  values,
  onChange,
  optionName,
  inputClass,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  optionName?: string;
  inputClass: string;
}) {
  const rows = values.length > 0 ? values : [''];

  const updateAt = useCallback(
    (index: number, value: string) => {
      const next = [...rows];
      next[index] = value;
      onChange(next);
    },
    [onChange, rows]
  );

  const addRow = useCallback(() => {
    onChange([...rows, '']);
  }, [onChange, rows]);

  const removeAt = useCallback(
    (index: number) => {
      if (rows.length <= 1) {
        onChange(['']);
        return;
      }
      onChange(rows.filter((_, i) => i !== index));
    },
    [onChange, rows]
  );

  return (
    <div className="space-y-2">
      {rows.map((value, index) => {
        const isLast = index === rows.length - 1;
        return (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => updateAt(index, e.target.value)}
              placeholder={
                optionName
                  ? `Enter a ${optionName.toLowerCase()}`
                  : 'Enter a value'
              }
              className={`min-w-0 flex-1 ${inputClass}`}
            />
            {rows.length > 1 ? (
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label={`Remove value ${index + 1}`}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            ) : null}
            {isLast ? (
              <button
                type="button"
                onClick={addRow}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200/80 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                aria-label="Add another value"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            ) : (
              <span className="inline-block h-9 w-9 shrink-0" aria-hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}

const ProductVariantsSection: React.FC<ProductVariantsSectionProps> = ({
  variants,
  onAddVariant,
  onRemoveVariant,
  onUpdateOptionName,
  onSetValues,
  appearance = 'minimal',
}) => {
  const inputClass = productFormInputClass(appearance);
  const labelClass = productFormLabelClass(appearance);

  const combinationCount = useMemo(() => {
    const counts = variants
      .map((option) => filledValues(option.values).length)
      .filter((count) => count > 0);
    if (counts.length === 0) return 0;
    return counts.reduce((total, count) => total * count, 1);
  }, [variants]);

  if (variants.length === 0) {
    return (
      <div className={productFormCardClass(appearance)}>
        <button
          type="button"
          onClick={onAddVariant}
          className="group flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50/50 px-4 py-8 text-center transition-colors hover:border-gray-400 hover:bg-gray-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-gray-200/80 transition-colors group-hover:text-gray-700">
            <SwatchIcon className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-[13px] font-medium text-gray-800">
            Add options like size or color
          </span>
          <span className="max-w-xs text-[12px] leading-relaxed text-gray-400">
            Skip this if you sell one version. Options create separate variants customers can pick.
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`${productFormCardClass(appearance)} space-y-4`}>
      <div className="space-y-3">
        {variants.map((variant, variantIndex) => {
          const chips = filledValues(variant.values);

          return (
            <div
              key={variantIndex}
              className="overflow-hidden rounded-lg border border-gray-200/70 bg-white"
            >
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800">
                    {variant.optionName.trim() || `Option ${variantIndex + 1}`}
                  </p>
                  <p className="text-[12px] text-gray-400">
                    {chips.length === 0
                      ? 'Add values customers can choose'
                      : `${chips.length} value${chips.length === 1 ? '' : 's'}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveVariant(variantIndex)}
                  className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-white hover:text-gray-700"
                  aria-label={`Remove option ${variantIndex + 1}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 px-3.5 py-3.5">
                <div>
                  <label className={labelClass}>Option name</label>
                  <input
                    type="text"
                    value={variant.optionName}
                    onChange={(e) => onUpdateOptionName(variantIndex, e.target.value)}
                    placeholder="e.g. Size, Color, Material"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    {variant.optionName.trim()
                      ? `Type values for ${variant.optionName.trim()}`
                      : 'Values'}
                  </label>
                  <VariantValueEditor
                    values={variant.values}
                    onChange={(next) => onSetValues(variantIndex, next)}
                    optionName={variant.optionName.trim()}
                    inputClass={inputClass}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={onAddVariant}
          className="inline-flex items-center gap-1.5 rounded-md px-1 py-1.5 text-[13px] font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          <PlusIcon className="h-4 w-4" aria-hidden />
          Add another option
        </button>
        {combinationCount > 0 ? (
          <p className="text-[12px] text-gray-400">
            Creates{' '}
            <span className="font-medium text-gray-600">
              {combinationCount} variant{combinationCount === 1 ? '' : 's'}
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default ProductVariantsSection;
