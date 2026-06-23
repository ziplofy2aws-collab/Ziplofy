import React from 'react';
import type { CheckoutSettingsPanelId } from './resolve-checkout-settings-panel';
import { CheckoutFooterSettingsPanel } from './CheckoutFooterSettingsPanel';
import { CheckoutHeaderSettingsPanel } from './CheckoutHeaderSettingsPanel';
import { CheckoutOrderSummarySettingsPanel } from './CheckoutOrderSummarySettingsPanel';
import type {
  CheckoutFooterConfig,
  CheckoutHeaderPosition,
  CheckoutOrderSummaryConfig,
} from './checkout-settings.types';

type Props = {
  panelId: CheckoutSettingsPanelId;
  headerPosition: CheckoutHeaderPosition;
  onHeaderPositionChange: (position: CheckoutHeaderPosition) => void;
  orderSummaryConfig: Required<CheckoutOrderSummaryConfig>;
  onOrderSummaryConfigChange: (patch: Partial<CheckoutOrderSummaryConfig>) => void;
  footerConfig: Required<CheckoutFooterConfig>;
  onFooterConfigChange: (patch: Partial<CheckoutFooterConfig>) => void;
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
    default:
      return null;
  }
}
