import React from 'react';
import type { CheckoutGlobalSettings } from './checkout-settings.types';
import {
  CheckoutLogoImageField,
  CheckoutLogoWidthField,
  CheckoutSegmentedAlignment,
  CheckoutSettingsRow,
} from './CheckoutThemeSettingsFields';
import { CheckoutSettingsPanelShell } from './CheckoutSettingsPanelShell';

type Props = {
  settings: Required<Pick<CheckoutGlobalSettings, 'logoImage' | 'logoWidth' | 'logoAlignment'>>;
  onSettingsChange: (patch: Partial<CheckoutGlobalSettings>) => void;
  onClose: () => void;
};

export function CheckoutLogoSettingsPanel({ settings, onSettingsChange, onClose }: Props) {
  return (
    <CheckoutSettingsPanelShell title="Logo" onClose={onClose}>
      <section className="space-y-4 px-4 py-4">
        <CheckoutSettingsRow label="Image">
          <CheckoutLogoImageField
            imageUrl={settings.logoImage}
            onChange={(logoImage) => onSettingsChange({ logoImage })}
          />
        </CheckoutSettingsRow>
        <CheckoutLogoWidthField
          value={settings.logoWidth}
          onChange={(logoWidth) => onSettingsChange({ logoWidth })}
        />
        <CheckoutSettingsRow label="Alignment">
          <CheckoutSegmentedAlignment
            value={settings.logoAlignment}
            onChange={(logoAlignment) => onSettingsChange({ logoAlignment })}
          />
        </CheckoutSettingsRow>
      </section>
    </CheckoutSettingsPanelShell>
  );
}
