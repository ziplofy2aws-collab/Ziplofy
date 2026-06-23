import React from 'react';
import type { CheckoutSettingsPanelId } from './resolve-checkout-settings-panel';
import { CheckoutFooterSettingsPanel } from './CheckoutFooterSettingsPanel';
import { CheckoutHeaderSettingsPanel } from './CheckoutHeaderSettingsPanel';
import { CheckoutOrderSummarySettingsPanel } from './CheckoutOrderSummarySettingsPanel';
import { CheckoutSignInMainSettingsPanel } from './CheckoutSignInMainSettingsPanel';
import { CheckoutThankYouMainSettingsPanel } from './CheckoutThankYouMainSettingsPanel';
import type {
  CheckoutFooterConfig,
  CheckoutHeaderPosition,
  CheckoutOrderSummaryConfig,
  CheckoutSignInMainConfig,
  CheckoutThankYouMainConfig,
} from './checkout-settings.types';

type Props = {
  panelId: CheckoutSettingsPanelId;
  headerPosition: CheckoutHeaderPosition;
  onHeaderPositionChange: (position: CheckoutHeaderPosition) => void;
  orderSummaryConfig: Required<CheckoutOrderSummaryConfig>;
  onOrderSummaryConfigChange: (patch: Partial<CheckoutOrderSummaryConfig>) => void;
  footerConfig: Required<CheckoutFooterConfig>;
  onFooterConfigChange: (patch: Partial<CheckoutFooterConfig>) => void;
  signInMainConfig?: Required<CheckoutSignInMainConfig>;
  onSignInMainConfigChange?: (patch: Partial<CheckoutSignInMainConfig>) => void;
  thankYouMainConfig?: Required<CheckoutThankYouMainConfig>;
  onThankYouMainConfigChange?: (patch: Partial<CheckoutThankYouMainConfig>) => void;
  onClose: () => void;
};

export function CheckoutEditorSettingsPanel({
  panelId,
  headerPosition,
  onHeaderPositionChange,
  orderSummaryConfig,
  onOrderSummaryConfigChange,
  footerConfig,
  onFooterConfigChange,
  signInMainConfig,
  onSignInMainConfigChange,
  thankYouMainConfig,
  onThankYouMainConfigChange,
  onClose,
}: Props) {
  switch (panelId) {
    case 'header':
      return (
        <CheckoutHeaderSettingsPanel
          position={headerPosition}
          onPositionChange={onHeaderPositionChange}
          onClose={onClose}
        />
      );
    case 'order-summary':
      return (
        <CheckoutOrderSummarySettingsPanel
          config={orderSummaryConfig}
          onConfigChange={onOrderSummaryConfigChange}
          onClose={onClose}
        />
      );
    case 'footer':
      return (
        <CheckoutFooterSettingsPanel
          config={footerConfig}
          onConfigChange={onFooterConfigChange}
          onClose={onClose}
        />
      );
    case 'sign-in-main':
      if (!signInMainConfig || !onSignInMainConfigChange) return null;
      return (
        <CheckoutSignInMainSettingsPanel
          config={signInMainConfig}
          onConfigChange={onSignInMainConfigChange}
          onClose={onClose}
        />
      );
    case 'thank-you-main':
      if (!thankYouMainConfig || !onThankYouMainConfigChange) return null;
      return (
        <CheckoutThankYouMainSettingsPanel
          config={thankYouMainConfig}
          onConfigChange={onThankYouMainConfigChange}
          onClose={onClose}
        />
      );
    default:
      return null;
  }
}
