import React, { useEffect, useState } from 'react';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';
import { ThemeSearchEmptyStateCollectionField } from './ThemeSearchEmptyStateCollectionField';
import {
  THEME_SEARCH_CORNER_RADIUS_MAX,
  THEME_SEARCH_CORNER_RADIUS_MIN,
  THEME_SEARCH_EMPTY_STATE_COLLECTION_HANDLE_PATH,
  THEME_SEARCH_EMPTY_STATE_COLLECTION_ID_PATH,
  THEME_SEARCH_EMPTY_STATE_COLLECTION_TITLE_PATH,
  THEME_SEARCH_POPOVER_CARD_CORNER_RADIUS_PATH,
  THEME_SEARCH_POPOVER_PRODUCT_CORNER_RADIUS_PATH,
  THEME_SEARCH_POPOVER_TITLE_CASE_PATH,
  THEME_SEARCH_TITLE_CASE_OPTIONS,
  readThemeSearchSettingsFromValues,
} from './theme-search.settings';

type Props = {
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
};

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="border-t border-[#e1e1e1] pt-3">
      <h3 className="mb-1 text-[13px] font-semibold text-gray-900">{title}</h3>
    </div>
  );
}

function SegmentedControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex w-full rounded-lg border border-[#c9cccf] bg-[#f1f1f1] p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded-md px-2 py-1 text-[12px] font-medium transition-colors ${
            value === opt.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function PxSliderField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, Math.round(next)));
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commitDraft = () => {
    const parsed = Number(draft);
    if (!Number.isFinite(parsed) || draft.trim() === '') {
      setDraft(String(value));
      return;
    }
    const clamped = clamp(parsed);
    setDraft(String(clamped));
    if (clamped !== value) onChange(clamped);
  };

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1.5">
      <span className="text-[13px] text-gray-800">{label}</span>
      <div className="flex min-w-[148px] max-w-[180px] items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          onInput={(e) => onChange(clamp(Number((e.target as HTMLInputElement).value)))}
          className="h-1.5 min-w-0 flex-1 cursor-pointer accent-gray-900"
          aria-label={label}
        />
        <div className="flex shrink-0 items-center rounded-lg border border-[#c9cccf] bg-white shadow-sm">
          <input
            type="text"
            inputMode="numeric"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitDraft();
              }
            }}
            className="w-10 border-0 bg-transparent py-2 pl-2 pr-0 text-right text-[13px] text-gray-900 focus:outline-none"
            aria-label={`${label} value`}
          />
          <span className="pr-2 text-[13px] text-gray-500">px</span>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1.5">
      <span className="text-[13px] text-gray-800">{label}</span>
      <div className="min-w-[148px] max-w-[180px]">{children}</div>
    </div>
  );
}

export function ThemeSearchSettingsPanel({ values, onFieldChange }: Props) {
  const search = readThemeSearchSettingsFromValues(values);

  const handleCollectionSelect = (
    collection: { id: string; title: string; handle: string } | null
  ) => {
    onFieldChange(
      THEME_SEARCH_EMPTY_STATE_COLLECTION_ID_PATH,
      'text',
      collection?.id ?? ''
    );
    onFieldChange(
      THEME_SEARCH_EMPTY_STATE_COLLECTION_TITLE_PATH,
      'text',
      collection?.title ?? ''
    );
    onFieldChange(
      THEME_SEARCH_EMPTY_STATE_COLLECTION_HANDLE_PATH,
      'text',
      collection?.handle ?? ''
    );
  };

  return (
    <div className="space-y-1">
      <ThemeSearchEmptyStateCollectionField
        collectionId={search.emptyStateCollectionId}
        collectionTitle={search.emptyStateCollectionTitle}
        onSelect={handleCollectionSelect}
      />

      <SectionHeading title="Search popover" />

      <PxSliderField
        label="Product corner radius"
        value={search.popover.productCornerRadius}
        min={THEME_SEARCH_CORNER_RADIUS_MIN}
        max={THEME_SEARCH_CORNER_RADIUS_MAX}
        onChange={(next) =>
          onFieldChange(THEME_SEARCH_POPOVER_PRODUCT_CORNER_RADIUS_PATH, 'number', next)
        }
      />
      <PxSliderField
        label="Card corner radius"
        value={search.popover.cardCornerRadius}
        min={THEME_SEARCH_CORNER_RADIUS_MIN}
        max={THEME_SEARCH_CORNER_RADIUS_MAX}
        onChange={(next) =>
          onFieldChange(THEME_SEARCH_POPOVER_CARD_CORNER_RADIUS_PATH, 'number', next)
        }
      />
      <SettingRow label="Product and card title case">
        <SegmentedControl
          value={search.popover.titleCase}
          options={THEME_SEARCH_TITLE_CASE_OPTIONS}
          onChange={(next) =>
            onFieldChange(THEME_SEARCH_POPOVER_TITLE_CASE_PATH, 'text', next)
          }
        />
      </SettingRow>
    </div>
  );
}
