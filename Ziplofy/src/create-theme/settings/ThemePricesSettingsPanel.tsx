import React from 'react';
import ToggleSwitch from '../../components/ToggleSwitch';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';
import { readBoolSetting } from './theme-animations.settings';
import {
  THEME_DEFAULT_PRICES,
  THEME_PRICES_CURRENCY_CART_ITEMS_PATH,
  THEME_PRICES_CURRENCY_CART_TOTAL_PATH,
  THEME_PRICES_CURRENCY_PRODUCT_CARDS_PATH,
  THEME_PRICES_CURRENCY_PRODUCT_PAGES_PATH,
} from './theme-prices.settings';

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

export function ThemePricesSettingsPanel({ values, onFieldChange }: Props) {
  const productPages = readBoolSetting(
    values[THEME_PRICES_CURRENCY_PRODUCT_PAGES_PATH],
    THEME_DEFAULT_PRICES.currencyCode.productPages
  );
  const productCards = readBoolSetting(
    values[THEME_PRICES_CURRENCY_PRODUCT_CARDS_PATH],
    THEME_DEFAULT_PRICES.currencyCode.productCards
  );
  const cartItems = readBoolSetting(
    values[THEME_PRICES_CURRENCY_CART_ITEMS_PATH],
    THEME_DEFAULT_PRICES.currencyCode.cartItems
  );
  const cartTotal = readBoolSetting(
    values[THEME_PRICES_CURRENCY_CART_TOTAL_PATH],
    THEME_DEFAULT_PRICES.currencyCode.cartTotal
  );

  return (
    <div className="space-y-1">
      <h3 className="pb-1 pt-0.5 text-[13px] font-semibold text-gray-900">Currency code</h3>
      <ToggleRow
        label="Product pages"
        checked={productPages}
        onChange={(checked) =>
          onFieldChange(THEME_PRICES_CURRENCY_PRODUCT_PAGES_PATH, 'boolean', checked)
        }
      />
      <ToggleRow
        label="Product cards"
        checked={productCards}
        onChange={(checked) =>
          onFieldChange(THEME_PRICES_CURRENCY_PRODUCT_CARDS_PATH, 'boolean', checked)
        }
      />
      <ToggleRow
        label="Cart items"
        checked={cartItems}
        onChange={(checked) =>
          onFieldChange(THEME_PRICES_CURRENCY_CART_ITEMS_PATH, 'boolean', checked)
        }
      />
      <ToggleRow
        label="Cart total"
        checked={cartTotal}
        onChange={(checked) =>
          onFieldChange(THEME_PRICES_CURRENCY_CART_TOTAL_PATH, 'boolean', checked)
        }
      />
    </div>
  );
}
