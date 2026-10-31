import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  CHECKOUT_HEADER_POSITION_OPTIONS,
  type CheckoutHeaderPosition,
} from './checkout-settings.types';
import { CheckoutSettingsPanelShell } from './CheckoutSettingsPanelShell';

type Props = {
  position: CheckoutHeaderPosition;
  onPositionChange: (position: CheckoutHeaderPosition) => void;
  onClose: () => void;
};

export function CheckoutHeaderSettingsPanel({ position, onPositionChange, onClose }: Props) {
  return (
    <CheckoutSettingsPanelShell title="Header" onClose={onClose}>
      <section className="border-b border-[#e1e1e1] px-4 py-4">
        <h4 className="text-[13px] font-semibold text-gray-900">Logo</h4>
        <p className="mt-2 text-[13px] leading-relaxed text-gray-700">
          Edit your logo in{' '}
          <Link
            to="/settings/general/branding"
            className="font-medium text-[#005bd3] hover:underline"
          >
            settings
          </Link>
          .
        </p>
      </section>

      <section className="px-4 py-4">
        <h4 className="text-[13px] font-semibold text-gray-900">Position</h4>
        <div className="mt-3 flex items-center justify-between gap-3">
          <label htmlFor="checkout-header-position" className="text-[13px] text-gray-800">
            Position
          </label>
          <div className="relative min-w-[148px]">
            <select
              id="checkout-header-position"
              value={position}
              onChange={(e) => onPositionChange(e.target.value as CheckoutHeaderPosition)}
              className="w-full appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-3 pr-9 text-[13px] text-gray-900 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
            >
              {CHECKOUT_HEADER_POSITION_OPTIONS.map((option) => (
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
      </section>
    </CheckoutSettingsPanelShell>
  );
}
