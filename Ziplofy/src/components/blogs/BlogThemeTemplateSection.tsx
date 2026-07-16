import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { axiosi } from '../../config/axios.config';
import {
  type ProductFormAppearance,
  productFormCardClass,
  productFormSectionTitleClass,
} from '../products/product-form-appearance';

export type BlogThemeTemplateOption = {
  value: string;
  label: string;
};

type BlogThemeTemplateSectionProps = {
  storeId: string | null | undefined;
  value: string;
  onChange: (value: string) => void;
  appearance?: ProductFormAppearance;
};

const DEFAULT_OPTION: BlogThemeTemplateOption = {
  value: 'default',
  label: 'Default blog',
};

export const BlogThemeTemplateSection: React.FC<BlogThemeTemplateSectionProps> = ({
  storeId,
  value,
  onChange,
  appearance = 'default',
}) => {
  const [options, setOptions] = useState<BlogThemeTemplateOption[]>([DEFAULT_OPTION]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) {
      setOptions([DEFAULT_OPTION]);
      setLoadError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    void axiosi
      .get<{ success: boolean; data?: BlogThemeTemplateOption[] }>(
        `/blogs/store/${storeId}/theme-templates`
      )
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setOptions(list.length ? list : [DEFAULT_OPTION]);
      })
      .catch(() => {
        if (cancelled) return;
        setOptions([DEFAULT_OPTION]);
        setLoadError('Could not load templates. Showing Default only.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  const selectedExists = options.some((opt) => opt.value === value);
  const selectedValue = selectedExists ? value : 'default';
  const selectedLabel =
    options.find((opt) => opt.value === selectedValue)?.label ?? DEFAULT_OPTION.label;

  const handleSelect = useCallback(
    (next: string) => {
      onChange(next);
    },
    [onChange]
  );

  return (
    <div className={productFormCardClass(appearance)} data-testid="blog-theme-template-section">
      <div className="mb-3">
        <h2
          className={productFormSectionTitleClass(appearance)
            .replace('mb-3 ', '')
            .replace('mb-4 ', '')}
        >
          Theme template
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          Selected: <span className="font-medium text-gray-800">{selectedLabel}</span>
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading templates…</p>
      ) : (
        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Theme template">
          {options.map((opt) => {
            const selected = opt.value === selectedValue;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => handleSelect(opt.value)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  selected
                    ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    selected ? 'border-gray-900 bg-gray-900' : 'border-gray-300 bg-white'
                  }`}
                  aria-hidden
                >
                  {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-gray-900">{opt.label}</span>
                  {opt.value === 'default' ? (
                    <span className="block text-xs text-gray-500">Default blog page layout</span>
                  ) : (
                    <span className="block truncate text-xs text-gray-500">{opt.value}</span>
                  )}
                </span>
                {selected ? (
                  <CheckCircleIcon className="h-5 w-5 shrink-0 text-gray-900" aria-hidden />
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {loadError ? <p className="mt-2 text-xs text-amber-700">{loadError}</p> : null}

      {!loading && options.length <= 1 ? (
        <p className="mt-3 text-xs leading-relaxed text-gray-500">
          Create more blog templates in{' '}
          <span className="font-medium">Themes → Edit theme → Blogs</span>, then come back here to
          assign one.
        </p>
      ) : (
        <p className="mt-3 text-xs leading-relaxed text-gray-500">
          This blog’s page on the storefront will use the selected template.
        </p>
      )}
    </div>
  );
};

export default BlogThemeTemplateSection;
