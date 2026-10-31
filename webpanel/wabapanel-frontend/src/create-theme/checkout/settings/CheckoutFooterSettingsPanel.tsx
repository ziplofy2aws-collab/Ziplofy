import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import React from 'react';
import {
  CHECKOUT_FOOTER_ALIGNMENT_OPTIONS,
  CHECKOUT_FOOTER_LOCATION_OPTIONS,
  type CheckoutFooterAlignment,
  type CheckoutFooterConfig,
  type CheckoutHeaderPosition,
} from './checkout-settings.types';
import { CheckoutSettingsPanelShell } from './CheckoutSettingsPanelShell';

type Props = {
  config: Required<CheckoutFooterConfig>;
  onConfigChange: (patch: Partial<CheckoutFooterConfig>) => void;
  onClose: () => void;
};

function SelectRow<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-[13px] text-gray-800">
        {label}
      </label>
      <div className="relative min-w-[148px]">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="w-full appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-3 pr-9 text-[13px] text-gray-900 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
        >
          {options.map((option) => (
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
  );
}

export function CheckoutFooterSettingsPanel({ config, onConfigChange, onClose }: Props) {
  return (
    <CheckoutSettingsPanelShell title="Footer" onClose={onClose}>
      <section className="border-b border-[#e1e1e1] px-4 py-4">
        <h4 className="text-[13px] font-semibold text-gray-900">Position</h4>
        <div className="mt-3">
          <SelectRow
            id="checkout-footer-location"
            label="Location"
            value={config.location}
            options={CHECKOUT_FOOTER_LOCATION_OPTIONS}
            onChange={(location) =>
              onConfigChange({ location: location as CheckoutHeaderPosition })
            }
          />
        </div>
      </section>

      <section className="px-4 py-4">
        <h4 className="text-[13px] font-semibold text-gray-900">Content</h4>
        <div className="mt-3">
          <SelectRow
            id="checkout-footer-alignment"
            label="Alignment"
            value={config.alignment}
            options={CHECKOUT_FOOTER_ALIGNMENT_OPTIONS}
            onChange={(alignment) =>
              onConfigChange({ alignment: alignment as CheckoutFooterAlignment })
            }
          />
        </div>
      </section>
    </CheckoutSettingsPanelShell>
  );
}
