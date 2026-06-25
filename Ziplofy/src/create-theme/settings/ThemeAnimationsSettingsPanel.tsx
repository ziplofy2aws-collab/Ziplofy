import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import React from 'react';
import ToggleSwitch from '../../components/ToggleSwitch';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';
import {
  THEME_ANIMATIONS_ADD_TO_CART_PATH,
  THEME_ANIMATIONS_CARD_HOVER_EFFECT_PATH,
  THEME_ANIMATIONS_PAGE_TRANSITION_PATH,
  THEME_ANIMATIONS_PRODUCT_CARD_TRANSITION_PATH,
  THEME_CARD_HOVER_EFFECT_OPTIONS,
  THEME_DEFAULT_ANIMATIONS,
  normalizeThemeCardHoverEffect,
  readBoolSetting,
} from './theme-animations.settings';

type Props = {
  values: Record<string, string | boolean>;
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

export function ThemeAnimationsSettingsPanel({ values, onFieldChange }: Props) {
  const pageTransition = readBoolSetting(
    values[THEME_ANIMATIONS_PAGE_TRANSITION_PATH],
    THEME_DEFAULT_ANIMATIONS.pageTransition
  );
  const productCardTransition = readBoolSetting(
    values[THEME_ANIMATIONS_PRODUCT_CARD_TRANSITION_PATH],
    THEME_DEFAULT_ANIMATIONS.productCardTransition
  );
  const addToCart = readBoolSetting(
    values[THEME_ANIMATIONS_ADD_TO_CART_PATH],
    THEME_DEFAULT_ANIMATIONS.addToCart
  );
  const cardHoverEffect = normalizeThemeCardHoverEffect(
    values[THEME_ANIMATIONS_CARD_HOVER_EFFECT_PATH]
  );

  return (
    <div className="space-y-1">
      <ToggleRow
        label="Page transition"
        checked={pageTransition}
        onChange={(checked) =>
          onFieldChange(THEME_ANIMATIONS_PAGE_TRANSITION_PATH, 'boolean', checked)
        }
      />
      <ToggleRow
        label="Product card to product page transition"
        checked={productCardTransition}
        onChange={(checked) =>
          onFieldChange(THEME_ANIMATIONS_PRODUCT_CARD_TRANSITION_PATH, 'boolean', checked)
        }
      />
      <ToggleRow
        label="Add to cart"
        checked={addToCart}
        onChange={(checked) => onFieldChange(THEME_ANIMATIONS_ADD_TO_CART_PATH, 'boolean', checked)}
      />

      <div className="pt-2">
        <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1.5">
          <span className="text-[13px] text-gray-800">Card hover effect</span>
          <div className="relative min-w-[148px] max-w-[180px]">
            <select
              value={cardHoverEffect}
              onChange={(e) =>
                onFieldChange(THEME_ANIMATIONS_CARD_HOVER_EFFECT_PATH, 'text', e.target.value)
              }
              className="w-full appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-3 pr-9 text-[13px] text-gray-900 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
            >
              {THEME_CARD_HOVER_EFFECT_OPTIONS.map((option) => (
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
        <p className="pr-2 text-[12px] leading-relaxed text-gray-500">
          Applies to product and collection cards
        </p>
      </div>
    </div>
  );
}
