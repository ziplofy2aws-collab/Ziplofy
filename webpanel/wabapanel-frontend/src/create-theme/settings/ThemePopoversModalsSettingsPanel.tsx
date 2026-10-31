import React, { useEffect, useState } from 'react';
import ToggleSwitch from '../../components/ToggleSwitch';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';
import { ThemePaletteColorField } from './ThemePaletteColorField';
import { readBoolSetting } from './theme-animations.settings';
import {
  THEME_DEFAULT_POPOVERS_MODALS,
  THEME_POPOVERS_MODALS_BACKGROUND_COLOR_PATH,
  THEME_POPOVERS_MODALS_BORDER_COLOR_PATH,
  THEME_POPOVERS_MODALS_BORDER_THICKNESS_MAX,
  THEME_POPOVERS_MODALS_BORDER_THICKNESS_MIN,
  THEME_POPOVERS_MODALS_BORDER_THICKNESS_PATH,
  THEME_POPOVERS_MODALS_CORNER_RADIUS_MAX,
  THEME_POPOVERS_MODALS_CORNER_RADIUS_MIN,
  THEME_POPOVERS_MODALS_CORNER_RADIUS_PATH,
  THEME_POPOVERS_MODALS_DROP_SHADOW_PATH,
  THEME_POPOVERS_MODALS_SHADOW_COLOR_PATH,
  THEME_POPOVERS_MODALS_TEXT_COLOR_PATH,
  readThemePopoversModalsSettingsFromValues,
} from './theme-popovers-modals.settings';

type Props = {
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
};

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

export function ThemePopoversModalsSettingsPanel({ values, colorPalette, onFieldChange }: Props) {
  const popoversModals = readThemePopoversModalsSettingsFromValues(values);
  const dropShadow = readBoolSetting(
    values[THEME_POPOVERS_MODALS_DROP_SHADOW_PATH],
    THEME_DEFAULT_POPOVERS_MODALS.dropShadow
  );

  return (
    <div className="space-y-0.5">
      <ThemePaletteColorField
        label="Background color"
        path={THEME_POPOVERS_MODALS_BACKGROUND_COLOR_PATH}
        values={values}
        colorPalette={colorPalette}
        defaultPaletteIndex={0}
        fallbackColor="#ffffff"
        onFieldChange={onFieldChange}
      />
      <ThemePaletteColorField
        label="Text color"
        path={THEME_POPOVERS_MODALS_TEXT_COLOR_PATH}
        values={values}
        colorPalette={colorPalette}
        defaultPaletteIndex={1}
        fallbackColor="#111827"
        onFieldChange={onFieldChange}
      />
      <PxSliderField
        label="Corner radius"
        value={popoversModals.cornerRadius}
        min={THEME_POPOVERS_MODALS_CORNER_RADIUS_MIN}
        max={THEME_POPOVERS_MODALS_CORNER_RADIUS_MAX}
        onChange={(next) =>
          onFieldChange(THEME_POPOVERS_MODALS_CORNER_RADIUS_PATH, 'number', String(next))
        }
      />
      <ThemePaletteColorField
        label="Border color"
        path={THEME_POPOVERS_MODALS_BORDER_COLOR_PATH}
        values={values}
        colorPalette={colorPalette}
        defaultPaletteIndex={1}
        fallbackColor="#111827"
        onFieldChange={onFieldChange}
      />
      <PxSliderField
        label="Border thickness"
        value={popoversModals.borderThickness}
        min={THEME_POPOVERS_MODALS_BORDER_THICKNESS_MIN}
        max={THEME_POPOVERS_MODALS_BORDER_THICKNESS_MAX}
        onChange={(next) =>
          onFieldChange(THEME_POPOVERS_MODALS_BORDER_THICKNESS_PATH, 'number', String(next))
        }
      />
      <div className="flex items-center justify-between gap-3 py-2">
        <span className="text-[13px] text-gray-800">Drop shadow</span>
        <ToggleSwitch
          checked={dropShadow}
          onChange={(checked) =>
            onFieldChange(THEME_POPOVERS_MODALS_DROP_SHADOW_PATH, 'boolean', checked)
          }
        />
      </div>
      {dropShadow ? (
        <ThemePaletteColorField
          label="Shadow"
          path={THEME_POPOVERS_MODALS_SHADOW_COLOR_PATH}
          values={values}
          colorPalette={colorPalette}
          defaultPaletteIndex={1}
          fallbackColor="#111827"
          onFieldChange={onFieldChange}
        />
      ) : null}
    </div>
  );
}
