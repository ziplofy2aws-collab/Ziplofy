import React from 'react';
import type {
  CheckoutFooterConfig,
  CheckoutHeaderPosition,
  CheckoutOrderSummaryConfig,
  CheckoutPaletteTheme,
  CheckoutThankYouMainConfig,
} from './settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from './settings/checkout-typography-fonts';
import { CheckoutOrderSummaryRuntimePreview } from './preview/CheckoutOrderSummaryRuntimePreview';
import { CheckoutThankYouMainContent, CHECKOUT_THANK_YOU_PREVIEW_DETAILS } from './CheckoutThankYouMainContent';
import { CheckoutThankYouShell } from './CheckoutThankYouShell';
import type { CheckoutLogoPreviewConfig } from './preview/CheckoutHeaderRuntimePreview';

type PreviewDevice = 'desktop' | 'mobile';

type Props = {
  device?: PreviewDevice;
  storeId?: string | null;
  storeName?: string;
  storeUrl?: string | null;
  headerPosition?: CheckoutHeaderPosition;
  mainConfig?: CheckoutThankYouMainConfig;
  footerConfig?: CheckoutFooterConfig;
  orderSummaryConfig?: CheckoutOrderSummaryConfig;
  logo?: CheckoutLogoPreviewConfig;
  theme?: CheckoutPaletteTheme;
  typography?: CheckoutTypographyTheme;
  highlightNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
};

export function CheckoutThankYouRuntimePreview({
  device = 'desktop',
  storeId,
  storeName,
  storeUrl,
  headerPosition = 'checkout_form',
  mainConfig,
  footerConfig,
  orderSummaryConfig,
  logo,
  theme,
  typography,
  highlightNodeId,
  onSelectNode,
}: Props) {
  return (
    <CheckoutThankYouShell
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
      highlightNodeId={highlightNodeId}
      onSelectNode={onSelectNode}
      main={
        <CheckoutThankYouMainContent
          storeId={storeId}
          theme={theme}
          typography={typography}
          device={device}
          footerConfig={footerConfig}
          mainConfig={mainConfig}
          details={CHECKOUT_THANK_YOU_PREVIEW_DETAILS}
          highlightNodeId={highlightNodeId}
          onSelectNode={onSelectNode}
        />
      }
      orderSummary={
        <CheckoutOrderSummaryRuntimePreview
          storeId={storeId}
          orderSummaryConfig={orderSummaryConfig}
          colorPalette={theme?.colorPalette}
          highlightNodeId={highlightNodeId}
          layout={device}
          onSelectNode={onSelectNode}
        />
      }
    />
  );
}
