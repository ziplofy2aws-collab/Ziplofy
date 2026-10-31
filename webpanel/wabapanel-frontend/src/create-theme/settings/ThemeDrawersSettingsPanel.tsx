import React from 'react';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';
import { ThemePaletteColorField } from './ThemePaletteColorField';
import {
  THEME_DRAWERS_BACKGROUND_COLOR_PATH,
  THEME_DRAWERS_BORDER_COLOR_PATH,
  THEME_DRAWERS_TEXT_COLOR_PATH,
} from './theme-drawers.settings';

type Props = {
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
};

export function ThemeDrawersSettingsPanel({ values, colorPalette, onFieldChange }: Props) {
  return (
    <div className="space-y-0.5">
      <ThemePaletteColorField
        label="Background color"
        path={THEME_DRAWERS_BACKGROUND_COLOR_PATH}
        values={values}
        colorPalette={colorPalette}
        defaultPaletteIndex={0}
        fallbackColor="#ffffff"
        onFieldChange={onFieldChange}
      />
      <ThemePaletteColorField
        label="Text color"
        path={THEME_DRAWERS_TEXT_COLOR_PATH}
        values={values}
        colorPalette={colorPalette}
        defaultPaletteIndex={1}
        fallbackColor="#111827"
        onFieldChange={onFieldChange}
      />
      <ThemePaletteColorField
        label="Border color"
        path={THEME_DRAWERS_BORDER_COLOR_PATH}
        values={values}
        colorPalette={colorPalette}
        defaultPaletteIndex={1}
        fallbackColor="#111827"
        onFieldChange={onFieldChange}
      />
    </div>
  );
}
