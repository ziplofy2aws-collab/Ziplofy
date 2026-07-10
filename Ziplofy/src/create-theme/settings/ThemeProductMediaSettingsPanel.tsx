import React, { useEffect, useState } from 'react';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';
import {
  THEME_PRODUCT_MEDIA_BORDER_OPACITY_MAX,
  THEME_PRODUCT_MEDIA_BORDER_OPACITY_MIN,
  THEME_PRODUCT_MEDIA_BORDER_OPACITY_PATH,
  THEME_PRODUCT_MEDIA_BORDER_STYLE_OPTIONS,
  THEME_PRODUCT_MEDIA_BORDER_STYLE_PATH,
  THEME_PRODUCT_MEDIA_BORDER_THICKNESS_MAX,
  THEME_PRODUCT_MEDIA_BORDER_THICKNESS_MIN,
  THEME_PRODUCT_MEDIA_BORDER_THICKNESS_PATH,
  THEME_PRODUCT_MEDIA_CORNER_RADIUS_MAX,
  THEME_PRODUCT_MEDIA_CORNER_RADIUS_MIN,
  THEME_PRODUCT_MEDIA_CORNER_RADIUS_PATH,
  readThemeProductMediaSettingsFromValues,
} from './theme-product-media.settings';

type Props = {
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
};

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1.5">
      <span className="text-[13px] text-gray-800">{label}</span>
      <div className="min-w-[148px] max-w-[180px]">{children}</div>
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
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: 'px' | '%';
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
          <span className="pr-2 text-[13px] text-gray-500">{unit}</span>
        </div>
      </div>
    </div>
  );
}

export function ThemeProductMediaSettingsPanel({ values, onFieldChange }: Props) {
  const productMedia = readThemeProductMediaSettingsFromValues(values);
  const borderStyle = productMedia.borderStyle;
  const showBorderFields = borderStyle === 'solid';

  return (
    <div className="space-y-0.5">
      <SettingRow label="Border style">
        <SegmentedControl
          value={borderStyle}
          options={THEME_PRODUCT_MEDIA_BORDER_STYLE_OPTIONS}
          onChange={(next) => onFieldChange(THEME_PRODUCT_MEDIA_BORDER_STYLE_PATH, 'text', next)}
        />
      </SettingRow>
      {showBorderFields ? (
        <>
          <PxSliderField
            label="Border thickness"
            value={productMedia.borderThickness}
            min={THEME_PRODUCT_MEDIA_BORDER_THICKNESS_MIN}
            max={THEME_PRODUCT_MEDIA_BORDER_THICKNESS_MAX}
            unit="px"
            onChange={(next) =>
              onFieldChange(THEME_PRODUCT_MEDIA_BORDER_THICKNESS_PATH, 'number', String(next))
            }
          />
          <PxSliderField
            label="Border opacity"
            value={productMedia.borderOpacity}
            min={THEME_PRODUCT_MEDIA_BORDER_OPACITY_MIN}
            max={THEME_PRODUCT_MEDIA_BORDER_OPACITY_MAX}
            unit="%"
            onChange={(next) =>
              onFieldChange(THEME_PRODUCT_MEDIA_BORDER_OPACITY_PATH, 'number', String(next))
            }
          />
        </>
      ) : null}
      <PxSliderField
        label="Corner radius"
        value={productMedia.cornerRadius}
        min={THEME_PRODUCT_MEDIA_CORNER_RADIUS_MIN}
        max={THEME_PRODUCT_MEDIA_CORNER_RADIUS_MAX}
        unit="px"
        onChange={(next) =>
          onFieldChange(THEME_PRODUCT_MEDIA_CORNER_RADIUS_PATH, 'number', String(next))
        }
      />
    </div>
  );
}
