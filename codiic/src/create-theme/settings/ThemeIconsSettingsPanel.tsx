import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';
import {
  THEME_DEFAULT_ICONS,
  THEME_ICON_STROKE_OPTIONS,
  THEME_ICONS_STROKE_PATH,
  normalizeThemeIconStroke,
} from './theme-icons.settings';

type Props = {
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
};

export function ThemeIconsSettingsPanel({ values, onFieldChange }: Props) {
  const stroke = normalizeThemeIconStroke(
    values[THEME_ICONS_STROKE_PATH] ?? THEME_DEFAULT_ICONS.stroke
  );

  return (
    <div className="space-y-0.5">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1.5">
        <span className="text-[13px] text-gray-800">Stroke</span>
        <div className="relative min-w-[148px] max-w-[180px]">
          <select
            value={stroke}
            onChange={(e) => onFieldChange(THEME_ICONS_STROKE_PATH, 'text', e.target.value)}
            className="w-full appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-3 pr-9 text-[13px] text-gray-900 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
          >
            {THEME_ICON_STROKE_OPTIONS.map((option) => (
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
      </div>
    </div>
  );
}
