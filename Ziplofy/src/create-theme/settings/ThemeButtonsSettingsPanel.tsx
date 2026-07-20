import React, { useEffect, useState } from 'react';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';
import { ThemeButtonBackgroundColorField } from './ThemeButtonBackgroundColorField';
import { ThemePaletteColorField } from './ThemePaletteColorField';
import {
  THEME_BUTTON_BORDER_THICKNESS_MAX,
  THEME_BUTTON_BORDER_THICKNESS_MIN,
  THEME_BUTTON_CORNER_RADIUS_MAX,
  THEME_BUTTON_CORNER_RADIUS_MIN,
  THEME_BUTTON_FONT_OPTIONS,
  THEME_BUTTONS_PILLS_CORNER_RADIUS_PATH,
  THEME_BUTTONS_PRIMARY_BACKGROUND_PATH,
  THEME_BUTTONS_PRIMARY_BORDER_PATH,
  THEME_BUTTONS_PRIMARY_BORDER_THICKNESS_PATH,
  THEME_BUTTONS_PRIMARY_CORNER_RADIUS_PATH,
  THEME_BUTTONS_PRIMARY_FONT_PATH,
  THEME_BUTTONS_PRIMARY_TEXT_CASE_PATH,
  THEME_BUTTONS_PRIMARY_TEXT_PATH,
  THEME_BUTTONS_SECONDARY_BACKGROUND_PATH,
  THEME_BUTTONS_SECONDARY_BORDER_PATH,
  THEME_BUTTONS_SECONDARY_BORDER_THICKNESS_PATH,
  THEME_BUTTONS_SECONDARY_CORNER_RADIUS_PATH,
  THEME_BUTTONS_SECONDARY_FONT_PATH,
  THEME_BUTTONS_SECONDARY_TEXT_CASE_PATH,
  THEME_BUTTONS_SECONDARY_TEXT_PATH,
  THEME_DEFAULT_BUTTONS,
  normalizeThemeButtonBorderThickness,
  normalizeThemeButtonCornerRadius,
  normalizeThemeButtonFontRole,
  normalizeThemeButtonTextCase,
} from './theme-buttons.settings';
import { THEME_TEXT_CASE_OPTIONS } from './theme-typography.settings';

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

function SectionHeading({
  title,
  helper,
  first = false,
}: {
  title: string;
  helper?: string;
  first?: boolean;
}) {
  return (
    <div className={first ? 'pb-1' : 'border-t border-[#e1e1e1] pt-3'}>
      <h3 className="mb-1 text-[13px] font-semibold text-gray-900">{title}</h3>
      {helper ? <p className="mb-1 text-[12px] leading-relaxed text-gray-500">{helper}</p> : null}
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

function ButtonVariantFields({
  variant,
  values,
  colorPalette,
  onFieldChange,
}: {
  variant: 'primary' | 'secondary';
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const defaults = THEME_DEFAULT_BUTTONS[variant];
  const backgroundPath =
    variant === 'primary'
      ? THEME_BUTTONS_PRIMARY_BACKGROUND_PATH
      : THEME_BUTTONS_SECONDARY_BACKGROUND_PATH;
  const textPath =
    variant === 'primary' ? THEME_BUTTONS_PRIMARY_TEXT_PATH : THEME_BUTTONS_SECONDARY_TEXT_PATH;
  const borderPath =
    variant === 'primary' ? THEME_BUTTONS_PRIMARY_BORDER_PATH : THEME_BUTTONS_SECONDARY_BORDER_PATH;
  const borderThicknessPath =
    variant === 'primary'
      ? THEME_BUTTONS_PRIMARY_BORDER_THICKNESS_PATH
      : THEME_BUTTONS_SECONDARY_BORDER_THICKNESS_PATH;
  const cornerRadiusPath =
    variant === 'primary'
      ? THEME_BUTTONS_PRIMARY_CORNER_RADIUS_PATH
      : THEME_BUTTONS_SECONDARY_CORNER_RADIUS_PATH;
  const fontPath =
    variant === 'primary' ? THEME_BUTTONS_PRIMARY_FONT_PATH : THEME_BUTTONS_SECONDARY_FONT_PATH;
  const textCasePath =
    variant === 'primary'
      ? THEME_BUTTONS_PRIMARY_TEXT_CASE_PATH
      : THEME_BUTTONS_SECONDARY_TEXT_CASE_PATH;

  const borderThickness = normalizeThemeButtonBorderThickness(
    values[borderThicknessPath],
    defaults.borderThickness
  );
  const cornerRadius = normalizeThemeButtonCornerRadius(
    values[cornerRadiusPath],
    defaults.cornerRadius
  );
  const font = normalizeThemeButtonFontRole(values[fontPath]);
  const textCase = normalizeThemeButtonTextCase(values[textCasePath]);

  return (
    <>
      {variant === 'secondary' ? (
        <ThemeButtonBackgroundColorField
          label="Background"
          path={backgroundPath}
          values={values}
          colorPalette={colorPalette}
          defaultPaletteIndex={0}
          fallbackColor="#ffffff"
          allowTransparent
          onFieldChange={onFieldChange}
        />
      ) : (
        <ThemePaletteColorField
          label="Background"
          path={backgroundPath}
          values={values}
          colorPalette={colorPalette}
          defaultPaletteIndex={1}
          fallbackColor="#111827"
          onFieldChange={onFieldChange}
        />
      )}
      <ThemePaletteColorField
        label="Text"
        path={textPath}
        values={values}
        colorPalette={colorPalette}
        defaultPaletteIndex={0}
        fallbackColor="#ffffff"
        onFieldChange={onFieldChange}
      />
      <ThemePaletteColorField
        label="Borders"
        path={borderPath}
        values={values}
        colorPalette={colorPalette}
        defaultPaletteIndex={1}
        fallbackColor="#111827"
        onFieldChange={onFieldChange}
      />
      <PxSliderField
        label="Border thickness"
        value={borderThickness}
        min={THEME_BUTTON_BORDER_THICKNESS_MIN}
        max={THEME_BUTTON_BORDER_THICKNESS_MAX}
        onChange={(next) => onFieldChange(borderThicknessPath, 'number', String(next))}
      />
      <PxSliderField
        label="Corner radius"
        value={cornerRadius}
        min={THEME_BUTTON_CORNER_RADIUS_MIN}
        max={THEME_BUTTON_CORNER_RADIUS_MAX}
        onChange={(next) => onFieldChange(cornerRadiusPath, 'number', String(next))}
      />
      <SettingRow label="Font">
        <SegmentedControl
          value={font}
          options={THEME_BUTTON_FONT_OPTIONS}
          onChange={(next) => onFieldChange(fontPath, 'text', next)}
        />
      </SettingRow>
      <SettingRow label="Text case">
        <SegmentedControl
          value={textCase}
          options={THEME_TEXT_CASE_OPTIONS}
          onChange={(next) => onFieldChange(textCasePath, 'text', next)}
        />
      </SettingRow>
    </>
  );
}

export function ThemeButtonsSettingsPanel({ values, colorPalette, onFieldChange }: Props) {
  const pillsRadius = normalizeThemeButtonCornerRadius(
    values[THEME_BUTTONS_PILLS_CORNER_RADIUS_PATH],
    THEME_DEFAULT_BUTTONS.pills.cornerRadius
  );

  return (
    <div className="space-y-0.5">
      <SectionHeading title="Primary button" first />
      <ButtonVariantFields
        variant="primary"
        values={values}
        colorPalette={colorPalette}
        onFieldChange={onFieldChange}
      />

      <SectionHeading title="Secondary button" />
      <ButtonVariantFields
        variant="secondary"
        values={values}
        colorPalette={colorPalette}
        onFieldChange={onFieldChange}
      />

      <SectionHeading
        title="Pills"
        helper="Used for applied filters, discount codes, and search suggestions"
      />
      <PxSliderField
        label="Corner radius"
        value={pillsRadius}
        min={THEME_BUTTON_CORNER_RADIUS_MIN}
        max={THEME_BUTTON_CORNER_RADIUS_MAX}
        onChange={(next) =>
          onFieldChange(THEME_BUTTONS_PILLS_CORNER_RADIUS_PATH, 'number', String(next))
        }
      />
    </div>
  );
}
