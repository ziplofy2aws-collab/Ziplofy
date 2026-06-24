import React from 'react';
import type { CheckoutEditorPage } from '../checkout-editor-page-menu';
import type {
  CheckoutFooterConfig,
  CheckoutHeaderPosition,
  CheckoutOrderSummaryConfig,
  CheckoutPaletteTheme,
} from '../settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import type { CheckoutLogoPreviewConfig } from './CheckoutHeaderRuntimePreview';
import { CheckoutCheckoutView } from '../CheckoutCheckoutView';

type PreviewDevice = 'desktop' | 'mobile';

type Props = {
  pageId: CheckoutEditorPage;
  device?: PreviewDevice;
  storeId?: string | null;
  storeName?: string;
  storeUrl?: string | null;
  headerPosition?: CheckoutHeaderPosition;
  footerConfig?: CheckoutFooterConfig;
  orderSummaryConfig?: CheckoutOrderSummaryConfig;
  logo?: CheckoutLogoPreviewConfig;
  theme?: CheckoutPaletteTheme;
  typography?: CheckoutTypographyTheme;
  inputFieldsTransparent?: boolean;
  addressAutocompletion?: boolean;
  highlightNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
};

export function CheckoutPageRuntimePreview({
  pageId,
  device = 'desktop',
  storeId,
  storeName,
  storeUrl,
  headerPosition = 'checkout_form',
  footerConfig,
  orderSummaryConfig,
  logo,
  theme,
  typography,
  inputFieldsTransparent = false,
  addressAutocompletion = false,
  highlightNodeId,
  onSelectNode,
}: Props) {
  if (pageId !== 'checkout') {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-white p-8 text-center">
        <p className="max-w-sm text-sm text-gray-600">
          Runtime preview for this page is coming soon.
        </p>
      </div>
    );
  }

  return (
    <CheckoutCheckoutView
      mode="preview"
      device={device}
      storeId={storeId}
      storeName={storeName}
      storeUrl={storeUrl}
      headerPosition={headerPosition}
      footerConfig={footerConfig}
      orderSummaryConfig={orderSummaryConfig}
      logo={logo}
      theme={theme}
      typography={typography}
      inputFieldsTransparent={inputFieldsTransparent}
      addressAutocompletion={addressAutocompletion}
      highlightNodeId={highlightNodeId}
      onSelectNode={onSelectNode}
    />
  );
}
