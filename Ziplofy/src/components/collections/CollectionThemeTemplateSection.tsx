import React, { useEffect, useState } from 'react';
import { axiosi } from '../../config/axios.config';

export interface CollectionThemeTemplateOption {
  value: string;
  label: string;
}

interface CollectionThemeTemplateSectionProps {
  storeId?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  selectClassName?: string;
}

const inputClass =
  'w-full rounded-lg border border-gray-200/90 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

const CollectionThemeTemplateSection: React.FC<CollectionThemeTemplateSectionProps> = ({
  storeId,
  value,
  onChange,
  disabled = false,
  className = 'rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6',
  selectClassName = inputClass,
}) => {
  const [options, setOptions] = useState<CollectionThemeTemplateOption[]>([
    { value: 'default', label: 'Default collection' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) {
      setOptions([{ value: 'default', label: 'Default collection' }]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    axiosi
      .get<{ success: boolean; data: CollectionThemeTemplateOption[] }>(
        `/collections/theme-templates/store/${storeId}`
      )
      .then((response) => {
        if (cancelled) return;
        const templates = response.data?.data?.length
          ? response.data.data
          : [{ value: 'default', label: 'Default collection' }];
        setOptions(templates);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Could not load theme templates. Using the default collection template.');
        setOptions([{ value: 'default', label: 'Default collection' }]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [storeId]);

  const normalizedValue = options.some((option) => option.value === value) ? value : 'default';

  return (
    <section className={className}>
      <h2 className="text-base font-semibold text-gray-900">Theme template</h2>
      <p className="mt-1 text-sm text-gray-500">Template used to render this collection page on your storefront.</p>
      <div className="mt-5 border-t border-gray-100 pt-5">
        <label htmlFor="collection-theme-template" className="mb-2 block text-sm font-medium text-gray-700">
          Template
        </label>
        <select
          id="collection-theme-template"
          value={normalizedValue}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled || loading || !storeId}
          className={`${selectClassName} ${disabled || loading || !storeId ? 'cursor-not-allowed bg-gray-50' : 'cursor-pointer'}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {loading ? <p className="mt-2 text-xs text-gray-500">Loading templates from your active theme…</p> : null}
        {!storeId ? (
          <p className="mt-2 text-xs text-gray-500">Select a store to load available theme templates.</p>
        ) : null}
        {error ? <p className="mt-2 text-xs text-amber-700">{error}</p> : null}
      </div>
    </section>
  );
};

export default CollectionThemeTemplateSection;
