import { ChevronUpDownIcon, PhotoIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { ThemeEditorImagePickerModal } from '../../sidebar/ThemeEditorImagePickerModal';
import {
  CHECKOUT_DEFAULT_THANK_YOU_MAIN_ACCENT,
  CHECKOUT_DEFAULT_THANK_YOU_MAIN_BACKGROUND,
  type CheckoutThankYouMainConfig,
} from './checkout-settings.types';
import { CheckoutSettingsPanelShell } from './CheckoutSettingsPanelShell';
import { CheckoutSettingsRow, CheckoutThemeColorField } from './CheckoutThemeSettingsFields';

type Props = {
  config: Required<CheckoutThankYouMainConfig>;
  onConfigChange: (patch: Partial<CheckoutThankYouMainConfig>) => void;
  onClose: () => void;
};

export function CheckoutThankYouMainSettingsPanel({ config, onConfigChange, onClose }: Props) {
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const hasImage = Boolean(config.backgroundImage?.trim());

  return (
    <CheckoutSettingsPanelShell title="Main" onClose={onClose}>
      <section className="border-b border-[#e1e1e1] px-4 py-4">
        <h4 className="text-[13px] font-semibold text-gray-900">Color</h4>
        <div className="mt-3 space-y-4">
          <CheckoutSettingsRow label="Background">
            <CheckoutThemeColorField
              value={config.backgroundColor}
              defaultHex={CHECKOUT_DEFAULT_THANK_YOU_MAIN_BACKGROUND}
              onChange={(backgroundColor) => onConfigChange({ backgroundColor })}
            />
          </CheckoutSettingsRow>
          <CheckoutSettingsRow label="Accent">
            <CheckoutThemeColorField
              value={config.accentColor}
              defaultHex={CHECKOUT_DEFAULT_THANK_YOU_MAIN_ACCENT}
              onChange={(accentColor) => onConfigChange({ accentColor })}
            />
          </CheckoutSettingsRow>
        </div>
      </section>

      <section className="px-4 py-4">
        <h4 className="text-[13px] font-semibold text-gray-900">Image</h4>
        <div className="mt-3">
          <CheckoutSettingsRow label="Image">
            <button
              type="button"
              onClick={() => setImagePickerOpen(true)}
              className="flex w-full min-w-0 items-center gap-2 rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-left text-[13px] text-gray-900 hover:bg-gray-50 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
            >
              <PhotoIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{hasImage ? 'Change image' : 'Add image'}</span>
              <ChevronUpDownIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
            </button>
          </CheckoutSettingsRow>
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
