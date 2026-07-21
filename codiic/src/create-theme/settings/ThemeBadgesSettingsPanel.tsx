import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';
import { ThemePaletteColorField } from './ThemePaletteColorField';
import {
  THEME_BADGE_CORNER_RADIUS_DEFAULT,
  THEME_BADGE_CORNER_RADIUS_MAX,
  THEME_BADGE_CORNER_RADIUS_MIN,
  THEME_BADGE_POSITION_OPTIONS,
  THEME_BADGES_CORNER_RADIUS_PATH,
  THEME_BADGES_FONT_PATH,
  THEME_BADGES_POSITION_PATH,
  THEME_BADGES_SALE_BACKGROUND_PATH,
  THEME_BADGES_SALE_TEXT_PATH,
  THEME_BADGES_SOLD_OUT_BACKGROUND_PATH,
  THEME_BADGES_SOLD_OUT_TEXT_PATH,
  THEME_BADGES_TEXT_CASE_PATH,
  normalizeThemeBadgeCornerRadius,
  normalizeThemeBadgeFontRole,
  normalizeThemeBadgePosition,
  normalizeThemeBadgeTextCase,
} from './theme-badges.settings';
import { THEME_FONT_ROLE_OPTIONS, THEME_TEXT_CASE_OPTIONS } from './theme-typography.settings';

type Props = {
  values: Record<string, string | boolean>;
  colorPalette: string[];
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

function CornerRadiusField({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const clamp = (next: number) =>
    Math.min(
      THEME_BADGE_CORNER_RADIUS_MAX,
      Math.max(THEME_BADGE_CORNER_RADIUS_MIN, Math.round(next))
    );

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
      <span className="text-[13px] text-gray-800">Corner radius</span>
      <div className="flex min-w-[148px] max-w-[180px] items-center gap-2">
        <input
          type="range"
          min={THEME_BADGE_CORNER_RADIUS_MIN}
          max={THEME_BADGE_CORNER_RADIUS_MAX}
          step={1}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          onInput={(e) => onChange(clamp(Number((e.target as HTMLInputElement).value)))}
          className="h-1.5 min-w-0 flex-1 cursor-pointer accent-gray-900"
          aria-label="Corner radius"
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
            aria-label="Corner radius value"
          />
          <span className="pr-2 text-[13px] text-gray-500">px</span>
        </div>
      </div>
    </div>
  );
}

export function ThemeBadgesSettingsPanel({ values, colorPalette, onFieldChange }: Props) {
  const position = normalizeThemeBadgePosition(values[THEME_BADGES_POSITION_PATH]);
  const cornerRadius = normalizeThemeBadgeCornerRadius(
    values[THEME_BADGES_CORNER_RADIUS_PATH] ?? THEME_BADGE_CORNER_RADIUS_DEFAULT
  );
  const font = normalizeThemeBadgeFontRole(values[THEME_BADGES_FONT_PATH]);
  const textCase = normalizeThemeBadgeTextCase(values[THEME_BADGES_TEXT_CASE_PATH]);

  return (
    <div className="space-y-0.5">
      <SettingRow label="Position on cards">
        <div className="relative w-full">
          <select
            value={position}
            onChange={(e) => onFieldChange(THEME_BADGES_POSITION_PATH, 'text', e.target.value)}
            className="w-full appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-3 pr-9 text-[13px] text-gray-900 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
          >
            {THEME_BADGE_POSITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronUpDownIcon
            className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            aria-hidden
          />
        </div>
      </SettingRow>

      <CornerRadiusField
        value={cornerRadius}
        onChange={(next) => onFieldChange(THEME_BADGES_CORNER_RADIUS_PATH, 'number', String(next))}
      />

      <SectionHeading title="Colors" />
      <ThemePaletteColorField
        label="Sale badge background"
        path={THEME_BADGES_SALE_BACKGROUND_PATH}
        values={values}
        colorPalette={colorPalette}
        defaultPaletteIndex={0}
        fallbackColor="#ffffff"
        onFieldChange={onFieldChange}
      />
      <ThemePaletteColorField
        label="Sale badge text"
        path={THEME_BADGES_SALE_TEXT_PATH}
        values={values}
        colorPalette={colorPalette}
        defaultPaletteIndex={1}
        fallbackColor="#111827"
        onFieldChange={onFieldChange}
      />
      <ThemePaletteColorField
        label="Sold out badge background"
        path={THEME_BADGES_SOLD_OUT_BACKGROUND_PATH}
        values={values}
        colorPalette={colorPalette}
        defaultPaletteIndex={0}
        fallbackColor="#EEF1EA"
        onFieldChange={onFieldChange}
      />
      <ThemePaletteColorField
        label="Sold out badge text"
        path={THEME_BADGES_SOLD_OUT_TEXT_PATH}
        values={values}
        colorPalette={colorPalette}
        defaultPaletteIndex={1}
        fallbackColor="#111827"
        onFieldChange={onFieldChange}
      />

      <SectionHeading title="Typography" />
      <SettingRow label="Font">
        <div className="relative w-full">
          <select
            value={font}
            onChange={(e) => onFieldChange(THEME_BADGES_FONT_PATH, 'text', e.target.value)}
            className="w-full appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-3 pr-9 text-[13px] text-gray-900 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
          >
            {THEME_FONT_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronUpDownIcon
            className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            aria-hidden
          />
        </div>
      </SettingRow>
      <SettingRow label="Case">
        <SegmentedControl
          value={textCase}
          options={THEME_TEXT_CASE_OPTIONS}
          onChange={(next) => onFieldChange(THEME_BADGES_TEXT_CASE_PATH, 'text', next)}
        />
      </SettingRow>
    </div>
  );
}
