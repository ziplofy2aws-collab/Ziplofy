import { ChevronUpDownIcon, PhotoIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { ThemeEditorImagePickerModal } from '../../sidebar/ThemeEditorImagePickerModal';
import {
  CHECKOUT_DEFAULT_SIGN_IN_MAIN_ACCENT,
  CHECKOUT_DEFAULT_SIGN_IN_MAIN_BACKGROUND,
  type CheckoutSignInMainConfig,
} from './checkout-settings.types';
import { CheckoutSettingsPanelShell } from './CheckoutSettingsPanelShell';
import { CheckoutSettingsRow, CheckoutThemeColorField } from './CheckoutThemeSettingsFields';

type ImagePickerTarget = 'logo' | 'media' | null;

type Props = {
  config: Required<CheckoutSignInMainConfig>;
  onConfigChange: (patch: Partial<CheckoutSignInMainConfig>) => void;
  onClose: () => void;
};

function CheckoutImagePickerRow({
  label,
  imageUrl,
  onOpen,
}: {
  label: string;
  imageUrl: string | null;
  onOpen: () => void;
}) {
  const hasImage = Boolean(imageUrl?.trim());

  return (
    <CheckoutSettingsRow label={label}>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full min-w-0 items-center gap-2 rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-left text-[13px] text-gray-900 hover:bg-gray-50 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
      >
        <PhotoIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
        <span className="min-w-0 flex-1 truncate">{hasImage ? 'Change image' : 'Add image'}</span>
        <ChevronUpDownIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
      </button>
    </CheckoutSettingsRow>
  );
}

export function CheckoutSignInMainSettingsPanel({ config, onConfigChange, onClose }: Props) {
  const [imagePickerTarget, setImagePickerTarget] = useState<ImagePickerTarget>(null);

  const pickerField =
    imagePickerTarget === 'logo'
      ? 'logoImage'
      : imagePickerTarget === 'media'
        ? 'mediaImage'
        : null;
  const pickerInitialUrl =
    pickerField === 'logoImage'
      ? config.logoImage
      : pickerField === 'mediaImage'
        ? config.mediaImage
        : '';

  return (
    <CheckoutSettingsPanelShell title="Main" onClose={onClose}>
      <section className="border-b border-[#e1e1e1] px-4 py-4">
        <h4 className="text-[13px] font-semibold text-gray-900">Logo</h4>
        <div className="mt-3">
          <CheckoutImagePickerRow
            label="Image"
            imageUrl={config.logoImage}
            onOpen={() => setImagePickerTarget('logo')}
          />
        </div>
        {config.logoImage ? (
          <div className="mt-3 overflow-hidden rounded-lg border border-[#e1e3e5] bg-white">
            <img src={config.logoImage} alt="" className="max-h-28 w-full object-contain p-2" />
            <div className="border-t border-[#e1e3e5] px-3 py-2">
              <button
                type="button"
                onClick={() => onConfigChange({ logoImage: null })}
                className="text-[12px] font-medium text-[#005bd3] hover:underline"
              >
                Remove image
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="border-b border-[#e1e1e1] px-4 py-4">
        <h4 className="text-[13px] font-semibold text-gray-900">Color</h4>
        <div className="mt-3 space-y-4">
          <CheckoutSettingsRow label="Background">
            <CheckoutThemeColorField
              value={config.backgroundColor}
              defaultHex={CHECKOUT_DEFAULT_SIGN_IN_MAIN_BACKGROUND}
              onChange={(backgroundColor) => onConfigChange({ backgroundColor })}
            />
          </CheckoutSettingsRow>
          <CheckoutSettingsRow label="Accent">
            <CheckoutThemeColorField
              value={config.accentColor}
              defaultHex={CHECKOUT_DEFAULT_SIGN_IN_MAIN_ACCENT}
              onChange={(accentColor) => onConfigChange({ accentColor })}
            />
          </CheckoutSettingsRow>
        </div>
      </section>

      <section className="px-4 py-4">
        <h4 className="text-[13px] font-semibold text-gray-900">Media</h4>
        <div className="mt-3">
          <CheckoutImagePickerRow
            label="Image"
            imageUrl={config.mediaImage}
            onOpen={() => setImagePickerTarget('media')}
          />
        </div>
        {config.mediaImage ? (
          <div className="mt-3 overflow-hidden rounded-lg border border-[#e1e3e5] bg-white">
            <img src={config.mediaImage} alt="" className="max-h-28 w-full object-cover" />
            <div className="border-t border-[#e1e3e5] px-3 py-2">
              <button
                type="button"
                onClick={() => onConfigChange({ mediaImage: null })}
                className="text-[12px] font-medium text-[#005bd3] hover:underline"
              >
                Remove image
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <ThemeEditorImagePickerModal
        open={pickerField !== null}
        onClose={() => setImagePickerTarget(null)}
        initialUrl={pickerInitialUrl ?? ''}
        onSelect={(url) => {
          if (pickerField) {
            onConfigChange({ [pickerField]: url });
          }
          setImagePickerTarget(null);
        }}
      />
    </CheckoutSettingsPanelShell>
  );
}
