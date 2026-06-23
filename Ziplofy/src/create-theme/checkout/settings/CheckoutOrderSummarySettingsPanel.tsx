import { ChevronUpDownIcon, PhotoIcon } from '@heroicons/react/24/outline';
import React, { useMemo, useState } from 'react';
import { ThemeEditorImagePickerModal } from '../../sidebar/ThemeEditorImagePickerModal';
import {
  CHECKOUT_DEFAULT_ORDER_SUMMARY_ACCENT,
  CHECKOUT_DEFAULT_ORDER_SUMMARY_BACKGROUND,
  type CheckoutColorSetting,
  type CheckoutOrderSummaryConfig,
  resolveCheckoutColorSetting,
} from './checkout-settings.types';
import { CheckoutSettingsPanelShell } from './CheckoutSettingsPanelShell';

type Props = {
  config: Required<CheckoutOrderSummaryConfig>;
  onConfigChange: (patch: Partial<CheckoutOrderSummaryConfig>) => void;
  onClose: () => void;
};

const CUSTOM_COLOR_OPTION = '__custom__';

function normalizeHexInput(value: string, fallback: string): string {
  const text = value.trim();
  if (!text) return fallback;
  const withHash = text.startsWith('#') ? text : `#${text}`;
  if (/^#[0-9a-fA-F]{6}$/.test(withHash)) return withHash.toLowerCase();
  return fallback;
}

function ColorSettingRow({
  id,
  label,
  value,
  defaultHex,
  onChange,
}: {
  id: string;
  label: string;
  value: CheckoutColorSetting;
  defaultHex: string;
  onChange: (value: CheckoutColorSetting) => void;
}) {
  const isDefault = value === 'default';
  const resolvedColor = resolveCheckoutColorSetting(value, defaultHex);
  const modeValue = isDefault ? 'default' : CUSTOM_COLOR_OPTION;

  const [draftHex, setDraftHex] = useState(resolvedColor);

  React.useEffect(() => {
    setDraftHex(resolvedColor);
  }, [resolvedColor]);

  const displayValue = useMemo(() => {
    if (isDefault) return 'Default';
    return resolvedColor.toUpperCase();
  }, [isDefault, resolvedColor]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[13px] text-gray-800">
          {label}
        </label>
        <div className="relative min-w-[208px]">
          <span
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded border border-[#e1e3e5]"
            style={{ background: resolvedColor }}
            aria-hidden
          />
          <select
            id={id}
            value={modeValue}
            onChange={(e) => {
              if (e.target.value === 'default') {
                onChange('default');
                return;
              }
              if (isDefault) {
                onChange(defaultHex);
              }
            }}
            className="w-full appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-9 pr-9 text-[13px] text-gray-900 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
          >
            <option value="default">Default</option>
            <option value={CUSTOM_COLOR_OPTION}>Custom</option>
          </select>
          <ChevronUpDownIcon
            className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            aria-hidden
          />
        </div>
      </div>

      {!isDefault ? (
        <div className="flex items-center justify-end gap-2">
          <label
            htmlFor={`${id}-picker`}
            className="h-9 w-9 cursor-pointer overflow-hidden rounded-lg border border-[#c9cccf]"
            style={{ background: resolvedColor }}
            title="Pick color"
          >
            <input
              id={`${id}-picker`}
              type="color"
              value={resolvedColor}
              className="sr-only"
              onChange={(e) => onChange(e.target.value)}
            />
          </label>
          <input
            type="text"
            value={draftHex.toUpperCase()}
            onChange={(e) => setDraftHex(e.target.value)}
            onBlur={() => onChange(normalizeHexInput(draftHex, resolvedColor))}
            className="w-[154px] rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] text-gray-900 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
            aria-label={`${label} hex color`}
          />
        </div>
      ) : (
        <p className="text-right text-[12px] text-gray-500">{displayValue}</p>
      )}
    </div>
  );
}

export function CheckoutOrderSummarySettingsPanel({ config, onConfigChange, onClose }: Props) {
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const hasImage = Boolean(config.backgroundImage?.trim());

  return (
    <CheckoutSettingsPanelShell title="Order summary" onClose={onClose}>
      <section className="border-b border-[#e1e1e1] px-4 py-4">
        <h4 className="text-[13px] font-semibold text-gray-900">Color</h4>
        <div className="mt-3 space-y-4">
          <ColorSettingRow
            id="checkout-summary-background"
            label="Background"
            value={config.backgroundColor}
            defaultHex={CHECKOUT_DEFAULT_ORDER_SUMMARY_BACKGROUND}
            onChange={(backgroundColor) => onConfigChange({ backgroundColor })}
          />
          <ColorSettingRow
            id="checkout-summary-accent"
            label="Accent"
            value={config.accentColor}
            defaultHex={CHECKOUT_DEFAULT_ORDER_SUMMARY_ACCENT}
            onChange={(accentColor) => onConfigChange({ accentColor })}
          />
        </div>
      </section>

      <section className="px-4 py-4">
        <h4 className="text-[13px] font-semibold text-gray-900">Image</h4>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-[13px] text-gray-800">Image</span>
          <button
            type="button"
            onClick={() => setImagePickerOpen(true)}
            className="flex min-w-[148px] max-w-[220px] flex-1 items-center gap-2 rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-left text-[13px] text-gray-900 hover:bg-gray-50 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
          >
            <PhotoIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
            <span className="min-w-0 flex-1 truncate">{hasImage ? 'Change image' : 'Add image'}</span>
            <ChevronUpDownIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
          </button>
        </div>
        {hasImage ? (
          <div className="mt-3 overflow-hidden rounded-lg border border-[#e1e3e5] bg-white">
            <img src={config.backgroundImage ?? ''} alt="" className="max-h-28 w-full object-cover" />
            <div className="border-t border-[#e1e3e5] px-3 py-2">
              <button
                type="button"
                onClick={() => onConfigChange({ backgroundImage: null })}
                className="text-[12px] font-medium text-[#005bd3] hover:underline"
              >
                Remove image
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <ThemeEditorImagePickerModal
        open={imagePickerOpen}
        onClose={() => setImagePickerOpen(false)}
        initialUrl={config.backgroundImage ?? ''}
        onSelect={(url) => onConfigChange({ backgroundImage: url })}
      />
    </CheckoutSettingsPanelShell>
  );
}
