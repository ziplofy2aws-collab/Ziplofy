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

type Props = {
  pageId: CheckoutEditorPage;
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
  highlightNodeId,
  onSelectNode,
  constrained = false,
}: {
  storeName?: string;
  storeUrl?: string | null;
  logo?: CheckoutLogoPreviewConfig;
  theme?: CheckoutPaletteTheme;
  highlightNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  constrained?: boolean;
}) {
  return (
    <div
      className="border-b border-[#e1e3e5]"
      style={{ backgroundColor: theme?.headerBackgroundColor ?? '#ffffff' }}
    >
      <div className={constrained ? `mx-auto w-full ${CHECKOUT_FORM_MAX_WIDTH_CLASS}` : 'w-full'}>
        <CheckoutHeaderRuntimePreview
          storeName={storeName}
          storeUrl={storeUrl}
          logo={logo}
          theme={theme}
          highlightNodeId={highlightNodeId}
          onSelectNode={onSelectNode}
        />
      </div>
    </div>
  );
}

function FooterSlot({
  footerConfig,
  highlightNodeId,
  constrained = false,
}: {
  footerConfig?: CheckoutFooterConfig;
  highlightNodeId?: string | null;
  constrained?: boolean;
}) {
  return (
    <div className={constrained ? '' : 'border-t border-[#e1e3e5] bg-white'}>
      <div className={constrained ? '' : 'w-full'}>
        <CheckoutFooterRuntimePreview
          alignment={footerConfig?.alignment ?? 'left'}
          highlightNodeId={highlightNodeId}
          constrained={constrained}
        />
      </div>
    </div>
  );
}

export function CheckoutPageRuntimePreview({
  pageId,
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
      <div className="flex min-h-full flex-1 items-center justify-center bg-white p-8 text-center">
        <p className="max-w-sm text-sm text-gray-600">
          Runtime preview for this page is coming soon.
        </p>
      </div>
    );
  }

  const isFullWidthHeader = headerPosition === 'full_width';
  const isFullWidthFooter = (footerConfig?.location ?? 'checkout_form') === 'full_width';

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <CheckoutTypographyFontLoader
        fonts={[typography?.headingGoogleFont, typography?.bodyGoogleFont]}
      />
      {isFullWidthHeader ? (
        <HeaderSlot
          storeName={storeName}
          storeUrl={storeUrl}
          logo={logo}
          theme={theme}
          highlightNodeId={highlightNodeId}
          onSelectNode={onSelectNode}
        />
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-[240px] min-w-0 flex-1 flex-col overflow-y-auto lg:min-h-0">
          {!isFullWidthHeader ? (
            <HeaderSlot
              storeName={storeName}
              storeUrl={storeUrl}
              logo={logo}
              theme={theme}
              highlightNodeId={highlightNodeId}
              onSelectNode={onSelectNode}
              constrained
            />
          ) : null}
          <div
            className="min-h-0 flex-1"
            style={{ backgroundColor: theme?.mainBackgroundColor ?? '#ffffff' }}
          >
            <CheckoutMainRuntimePreview
              accentColor={theme?.accentColor}
              buttonColor={theme?.buttonColor}
              addressAutocompletion={addressAutocompletion}
              inputFieldsTransparent={inputFieldsTransparent}
              typography={typography}
            />
            {!isFullWidthFooter ? (
              <FooterSlot footerConfig={footerConfig} highlightNodeId={highlightNodeId} constrained />
            ) : null}
          </div>
        </div>
        <div className="w-full border-t border-[#e1e3e5] bg-[#fafafa] lg:w-[42%] lg:max-w-[480px] lg:border-t-0 lg:border-l">
          <CheckoutOrderSummaryRuntimePreview
            storeId={storeId}
            orderSummaryConfig={orderSummaryConfig}
            highlightNodeId={highlightNodeId}
          />
        </div>
      </div>

      {isFullWidthFooter ? (
        <FooterSlot footerConfig={footerConfig} highlightNodeId={highlightNodeId} />
      ) : null}
    </div>
  );
}
