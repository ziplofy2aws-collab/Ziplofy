import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import ToggleSwitch from '../../components/ToggleSwitch';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';
import { ThemeCartEmptyLinkField } from './ThemeCartEmptyLinkField';
import { readBoolSetting } from './theme-animations.settings';
import {
  THEME_CART_ACCELERATED_CHECKOUT_PATH,
  THEME_CART_ALLOW_DISCOUNTS_PATH,
  THEME_CART_ALLOW_NOTE_PATH,
  THEME_CART_DRAWER_AUTO_OPEN_PATH,
  THEME_CART_EMPTY_LINK_PATH,
  THEME_CART_INSTALLMENTS_PATH,
  THEME_CART_PRICE_FONT_PATH,
  THEME_CART_PRODUCT_TITLE_CASE_PATH,
  THEME_CART_TYPE_OPTIONS,
  THEME_CART_TYPE_PATH,
  THEME_DEFAULT_CART,
  normalizeThemeCartPriceFont,
  normalizeThemeCartTextCase,
  normalizeThemeCartType,
} from './theme-cart.settings';
import { THEME_FONT_ROLE_OPTIONS, THEME_TEXT_CASE_OPTIONS } from './theme-typography.settings';

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

export function ThemeCartSettingsPanel({ values, onFieldChange }: Props) {
  const cartType = normalizeThemeCartType(values[THEME_CART_TYPE_PATH]);
  const productTitleCase = normalizeThemeCartTextCase(values[THEME_CART_PRODUCT_TITLE_CASE_PATH]);
  const priceFont = normalizeThemeCartPriceFont(values[THEME_CART_PRICE_FONT_PATH]);
  const cartDrawerAutoOpen = readBoolSetting(
    values[THEME_CART_DRAWER_AUTO_OPEN_PATH],
    THEME_DEFAULT_CART.cartDrawerAutoOpen
  );
  const allowNoteToSeller = readBoolSetting(
    values[THEME_CART_ALLOW_NOTE_PATH],
    THEME_DEFAULT_CART.allowNoteToSeller
  );
  const allowDiscounts = readBoolSetting(
    values[THEME_CART_ALLOW_DISCOUNTS_PATH],
    THEME_DEFAULT_CART.allowDiscounts
  );
  const installments = readBoolSetting(
    values[THEME_CART_INSTALLMENTS_PATH],
    THEME_DEFAULT_CART.installments
  );
  const acceleratedCheckout = readBoolSetting(
    values[THEME_CART_ACCELERATED_CHECKOUT_PATH],
    THEME_DEFAULT_CART.acceleratedCheckout
  );

  return (
    <div className="space-y-0.5">
      <SettingRow label="Type">
        <SegmentedControl
          value={cartType}
          options={THEME_CART_TYPE_OPTIONS}
          onChange={(next) => onFieldChange(THEME_CART_TYPE_PATH, 'text', next)}
        />
      </SettingRow>
      <SettingRow label="Product title case">
        <SegmentedControl
          value={productTitleCase}
          options={THEME_TEXT_CASE_OPTIONS}
          onChange={(next) => onFieldChange(THEME_CART_PRODUCT_TITLE_CASE_PATH, 'text', next)}
        />
      </SettingRow>
      <SettingRow label="Price font">
        <div className="relative w-full">
          <select
            value={priceFont}
            onChange={(e) => onFieldChange(THEME_CART_PRICE_FONT_PATH, 'text', e.target.value)}
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
      <ToggleRow
        label={`"Add to cart" auto-opens drawer`}
        checked={cartDrawerAutoOpen}
        onChange={(checked) => onFieldChange(THEME_CART_DRAWER_AUTO_OPEN_PATH, 'boolean', checked)}
      />

      <SectionHeading title="Cart features" />
      <ToggleRow
        label="Allow note to seller"
        checked={allowNoteToSeller}
        onChange={(checked) => onFieldChange(THEME_CART_ALLOW_NOTE_PATH, 'boolean', checked)}
      />
      <ToggleRow
        label="Allow discounts in cart"
        checked={allowDiscounts}
        onChange={(checked) => onFieldChange(THEME_CART_ALLOW_DISCOUNTS_PATH, 'boolean', checked)}
      />
      <ToggleRow
        label="Installments"
        checked={installments}
        onChange={(checked) => onFieldChange(THEME_CART_INSTALLMENTS_PATH, 'boolean', checked)}
      />
      <ToggleRow
        label="Accelerated checkout buttons"
        checked={acceleratedCheckout}
        onChange={(checked) =>
          onFieldChange(THEME_CART_ACCELERATED_CHECKOUT_PATH, 'boolean', checked)
        }
      />
      <p className="-mt-1 pb-1 text-[12px] leading-relaxed text-gray-500">
        Allows buyers to check out faster and can improve conversion.{' '}
        <a
          href="https://help.shopify.com/manual/online-store/themes/customizing-themes/accelerated-checkout"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#005bd3] hover:underline"
        >
          Learn more
        </a>
      </p>

      <ThemeCartEmptyLinkField
        path={THEME_CART_EMPTY_LINK_PATH}
        values={values}
        onFieldChange={onFieldChange}
      />
    </div>
  );
}
