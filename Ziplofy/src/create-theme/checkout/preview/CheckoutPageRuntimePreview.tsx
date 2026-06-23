import React from 'react';
import type { CheckoutEditorPage } from '../checkout-editor-page-menu';
import type {
  CheckoutFooterConfig,
  CheckoutHeaderPosition,
  CheckoutOrderSummaryConfig,
  CheckoutPaletteTheme,
} from '../settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import { CHECKOUT_FORM_MAX_WIDTH_CLASS } from '../settings/checkout-settings.types';
import { CheckoutFooterRuntimePreview } from './CheckoutFooterRuntimePreview';
import { CheckoutHeaderRuntimePreview, type CheckoutLogoPreviewConfig } from './CheckoutHeaderRuntimePreview';
import { CheckoutMainRuntimePreview } from './CheckoutMainRuntimePreview';
import { CheckoutOrderSummaryRuntimePreview } from './CheckoutOrderSummaryRuntimePreview';
import { CheckoutTypographyFontLoader } from './CheckoutTypographyFontLoader';

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

function HeaderSlot({
  storeName,
  storeUrl,
  logo,
  theme,
  device,
  highlightNodeId,
  onSelectNode,
  constrained = false,
}: {
  storeName?: string;
  storeUrl?: string | null;
  logo?: CheckoutLogoPreviewConfig;
  theme?: CheckoutPaletteTheme;
  device: PreviewDevice;
  highlightNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  constrained?: boolean;
}) {
  return (
    <div
      className="shrink-0 border-b border-[#e1e3e5]"
      style={{ backgroundColor: theme?.headerBackgroundColor ?? '#ffffff' }}
    >
      <div className={constrained ? `mx-auto w-full ${CHECKOUT_FORM_MAX_WIDTH_CLASS}` : 'w-full'}>
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
}

function FooterSlot({
  footerConfig,
  device,
  highlightNodeId,
  onSelectNode,
  constrained = false,
}: {
  footerConfig?: CheckoutFooterConfig;
  device: PreviewDevice;
  highlightNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  constrained?: boolean;
}) {
  return (
    <div className={constrained ? '' : 'border-t border-[#e1e3e5] bg-white'}>
      <div className={constrained ? '' : 'w-full'}>
        <CheckoutFooterRuntimePreview
          alignment={footerConfig?.alignment ?? 'left'}
          device={device}
          highlightNodeId={highlightNodeId}
          onSelectNode={onSelectNode}
          constrained={constrained}
        />
      </div>
    </div>
  );
}

function OrderSummarySlot({
  storeId,
  orderSummaryConfig,
  device,
  highlightNodeId,
  onSelectNode,
  sticky = false,
}: {
  storeId?: string | null;
  orderSummaryConfig?: CheckoutOrderSummaryConfig;
  device: PreviewDevice;
  highlightNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  sticky?: boolean;
}) {
  const isMobile = device === 'mobile';

  return (
    <div
      className={
        isMobile
          ? 'w-full shrink-0 border-b border-[#e1e3e5] bg-[#fafafa]'
          : `w-[42%] max-w-[480px] shrink-0 self-start border-l border-[#e1e3e5] bg-[#fafafa] ${
              sticky ? 'sticky top-0 max-h-full overflow-y-auto overscroll-contain' : ''
            }`
      }
    >
      <CheckoutOrderSummaryRuntimePreview
        storeId={storeId}
        orderSummaryConfig={orderSummaryConfig}
        highlightNodeId={highlightNodeId}
        layout={device}
        onSelectNode={onSelectNode}
      />
    </div>
  );
}

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

  const isMobile = device === 'mobile';
  const isFullWidthHeader = headerPosition === 'full_width';
  const isFullWidthFooter = (footerConfig?.location ?? 'checkout_form') === 'full_width';

  const mainColumn = (
    <div className="min-w-0 flex-1">
      {!isFullWidthHeader ? (
        <HeaderSlot
          storeName={storeName}
          storeUrl={storeUrl}
          logo={logo}
          theme={theme}
          device={device}
          highlightNodeId={highlightNodeId}
          onSelectNode={onSelectNode}
          constrained={!isMobile}
        />
      ) : null}
      <div style={{ backgroundColor: theme?.mainBackgroundColor ?? '#ffffff' }}>
        <CheckoutMainRuntimePreview
          accentColor={theme?.accentColor}
          buttonColor={theme?.buttonColor}
          addressAutocompletion={addressAutocompletion}
          inputFieldsTransparent={inputFieldsTransparent}
          typography={typography}
          device={device}
        />
        {!isFullWidthFooter ? (
          <FooterSlot
            footerConfig={footerConfig}
            device={device}
            highlightNodeId={highlightNodeId}
            onSelectNode={onSelectNode}
            constrained={!isMobile}
          />
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <CheckoutTypographyFontLoader
        fonts={[typography?.headingGoogleFont, typography?.bodyGoogleFont]}
      />
      {isFullWidthHeader ? (
        <HeaderSlot
          storeName={storeName}
          storeUrl={storeUrl}
          logo={logo}
          theme={theme}
          device={device}
          highlightNodeId={highlightNodeId}
          onSelectNode={onSelectNode}
        />
      ) : null}

      <div className="checkout-preview-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div
          className={`mx-auto flex w-full ${isMobile ? 'max-w-none flex-col' : 'min-h-full flex-row items-start'}`}
        >
          {isMobile ? (
            <OrderSummarySlot
              storeId={storeId}
              orderSummaryConfig={orderSummaryConfig}
              device={device}
              highlightNodeId={highlightNodeId}
              onSelectNode={onSelectNode}
            />
          ) : null}

          {mainColumn}

          {!isMobile ? (
            <OrderSummarySlot
              storeId={storeId}
              orderSummaryConfig={orderSummaryConfig}
              device={device}
              highlightNodeId={highlightNodeId}
              onSelectNode={onSelectNode}
              sticky
            />
          ) : null}
        </div>
      </div>

      {isFullWidthFooter ? (
        <FooterSlot
          footerConfig={footerConfig}
          device={device}
          highlightNodeId={highlightNodeId}
          onSelectNode={onSelectNode}
        />
      ) : null}
    </div>
  );
}
