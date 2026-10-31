import React from 'react';
import ToggleSwitch from '../../components/ToggleSwitch';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';
import { ThemePaletteColorField } from './ThemePaletteColorField';
import { readBoolSetting } from './theme-animations.settings';
import {
  THEME_DEFAULT_PRODUCT_CARDS,
  THEME_PRODUCT_CARDS_BACKGROUND_COLOR_PATH,
  THEME_PRODUCT_CARDS_MOBILE_QUICK_ADD_PATH,
  THEME_PRODUCT_CARDS_QUICK_ADD_PATH,
  THEME_PRODUCT_CARDS_TEXT_COLOR_PATH,
} from './theme-product-cards.settings';

type Props = {
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
};

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="min-w-0 flex-1 text-[13px] leading-snug text-gray-800">{label}</span>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

export function ThemeProductCardsSettingsPanel({ values, colorPalette, onFieldChange }: Props) {
  const quickAdd = readBoolSetting(
    values[THEME_PRODUCT_CARDS_QUICK_ADD_PATH],
    THEME_DEFAULT_PRODUCT_CARDS.quickAdd
  );
  const mobileQuickAdd = readBoolSetting(
    values[THEME_PRODUCT_CARDS_MOBILE_QUICK_ADD_PATH],
    THEME_DEFAULT_PRODUCT_CARDS.mobileQuickAdd
  );

  return (
    <div className="space-y-1">
      <ToggleRow
        label="Quick add"
        checked={quickAdd}
        onChange={(checked) =>
          onFieldChange(THEME_PRODUCT_CARDS_QUICK_ADD_PATH, 'boolean', checked)
        }
      />
      <ToggleRow
        label="Mobile quick add"
        checked={mobileQuickAdd}
        onChange={(checked) =>
          onFieldChange(THEME_PRODUCT_CARDS_MOBILE_QUICK_ADD_PATH, 'boolean', checked)
        }
      />
      <ThemePaletteColorField
        label="Background"
        path={THEME_PRODUCT_CARDS_BACKGROUND_COLOR_PATH}
        values={values}
        colorPalette={colorPalette}
        defaultPaletteIndex={0}
        fallbackColor="#ffffff"
        onFieldChange={onFieldChange}
      />
      <ThemePaletteColorField
        label="Text"
        path={THEME_PRODUCT_CARDS_TEXT_COLOR_PATH}
        values={values}
        colorPalette={colorPalette}
        defaultPaletteIndex={1}
        fallbackColor="#111827"
        onFieldChange={onFieldChange}
      />
    </div>
  );
}
