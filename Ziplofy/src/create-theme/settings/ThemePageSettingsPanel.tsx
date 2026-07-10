import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';
import { ThemePaletteColorField } from './ThemePaletteColorField';
import {
  THEME_PAGE_BACKGROUND_COLOR_PATH,
  THEME_PAGE_WIDTH_OPTIONS,
  THEME_PAGE_WIDTH_PATH,
  normalizeThemePageWidth,
} from './theme-page.settings';

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

export function ThemePageSettingsPanel({ values, colorPalette, onFieldChange }: Props) {
  const pageWidth = normalizeThemePageWidth(
    typeof values[THEME_PAGE_WIDTH_PATH] === 'string' ? values[THEME_PAGE_WIDTH_PATH] : 'narrow'
  );

  return (
    <div className="space-y-0.5">
      <ThemePaletteColorField
        label="Background"
        path={THEME_PAGE_BACKGROUND_COLOR_PATH}
        values={values}
        colorPalette={colorPalette}
        defaultPaletteIndex={0}
        fallbackColor="#ffffff"
        onFieldChange={onFieldChange}
      />
      <SettingRow label="Page width">
        <div className="relative w-full">
          <select
            value={pageWidth}
            onChange={(e) => onFieldChange(THEME_PAGE_WIDTH_PATH, 'text', e.target.value)}
            className="w-full appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-3 pr-9 text-[13px] text-gray-900 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
          >
            {THEME_PAGE_WIDTH_OPTIONS.map((option) => (
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
    </div>
  );
}
