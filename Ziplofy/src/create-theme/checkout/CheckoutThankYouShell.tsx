import type { ReactNode } from 'react';
import type {
  CheckoutFooterConfig,
  CheckoutHeaderPosition,
  CheckoutOrderSummaryConfig,
  CheckoutPaletteTheme,
} from './settings/checkout-settings.types';
import { CHECKOUT_FORM_MAX_WIDTH_CLASS, resolveCheckoutOrderSummaryColors } from './settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from './settings/checkout-typography-fonts';
import { CheckoutFooterRuntimePreview } from './preview/CheckoutFooterRuntimePreview';
import { CheckoutHeaderRuntimePreview, type CheckoutLogoPreviewConfig } from './preview/CheckoutHeaderRuntimePreview';
import { CheckoutTypographyFontLoader } from './preview/CheckoutTypographyFontLoader';

type Props = {
  device?: 'desktop' | 'mobile';
  storeId?: string | null;
  storeName?: string;
  storeUrl?: string | null;
  headerPosition?: CheckoutHeaderPosition;
  footerConfig?: CheckoutFooterConfig;
  orderSummaryConfig?: CheckoutOrderSummaryConfig;
  logo?: CheckoutLogoPreviewConfig;
  theme?: CheckoutPaletteTheme;
  typography?: CheckoutTypographyTheme;
  highlightNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  main: ReactNode;
  orderSummary: ReactNode;
  scrollable?: boolean;
};

export function CheckoutThankYouShell({
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
  highlightNodeId = null,
  onSelectNode,
  main,
  orderSummary,
  scrollable = true,
}: Props) {
  const isMobile = device === 'mobile';
  const isFullWidthHeader = headerPosition === 'full_width';
  const isFullWidthFooter = (footerConfig?.location ?? 'checkout_form') === 'full_width';
  const orderSummaryBackground = resolveCheckoutOrderSummaryColors(
    orderSummaryConfig,
    theme?.colorPalette
  ).backgroundColor;

  const headerSlot = (
    <div
      className="shrink-0 border-b border-[#e1e3e5]"
      style={{ backgroundColor: theme?.headerBackgroundColor ?? '#ffffff' }}
    >
      <div className={isMobile ? 'w-full' : `mx-auto w-full ${CHECKOUT_FORM_MAX_WIDTH_CLASS}`}>
        <CheckoutHeaderRuntimePreview
          storeName={storeName}
          storeUrl={storeUrl}
          logo={logo}
          theme={theme}
          device={device}
          highlightNodeId={highlightNodeId}
          onSelectNode={onSelectNode}
        />
      </div>
    </div>
  );

  const orderSummarySlot = (
    <div
      className={
        isMobile
          ? 'w-full shrink-0 border-b border-[#e1e3e5]'
          : 'flex min-h-full min-w-0 flex-1 flex-col border-l border-[#e1e3e5]'
      }
      style={{ backgroundColor: orderSummaryBackground }}
    >
      {orderSummary}
    </div>
  );

  const contentRow = (
    <div
      className={`flex w-full ${
        isMobile ? 'max-w-none flex-col' : 'min-h-full flex-row items-stretch'
      }`}
    >
      {isMobile ? orderSummarySlot : null}

      <div className="flex min-h-full min-w-0 flex-1 flex-col bg-white">
        {!isFullWidthHeader ? headerSlot : null}
        {main}
      </div>

      {!isMobile ? orderSummarySlot : null}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <CheckoutTypographyFontLoader fonts={[typography?.headingGoogleFont, typography?.bodyGoogleFont]} />
      {isFullWidthHeader ? headerSlot : null}
      {scrollable ? (
        <div className="checkout-preview-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {contentRow}
        </div>
      ) : (
        <div className="min-h-0 flex-1">{contentRow}</div>
      )}
      {isFullWidthFooter ? (
        <CheckoutFooterRuntimePreview
          storeId={storeId}
          alignment={footerConfig?.alignment ?? 'left'}
          accentColor={theme?.accentColor}
          device={device}
          highlightNodeId={highlightNodeId}
          onSelectNode={onSelectNode}
        />
      ) : null}
    </div>
  );
}
