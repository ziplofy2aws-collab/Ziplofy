import React from 'react';
import type { CheckoutEditorPage } from '../checkout-editor-page-menu';
import type { CheckoutHeaderPosition, CheckoutFooterConfig, CheckoutOrderSummaryConfig, CheckoutSignInMainConfig, CheckoutThankYouMainConfig, CheckoutPaletteTheme } from '../settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import { CheckoutAccountProfileRuntimePreview } from './CheckoutAccountProfileRuntimePreview';
import { CheckoutOrdersRuntimePreview } from './CheckoutOrdersRuntimePreview';
import { CheckoutOrderStatusRuntimePreview } from './CheckoutOrderStatusRuntimePreview';
import { CheckoutPageRuntimePreview } from './CheckoutPageRuntimePreview';
import { CheckoutSignInRuntimePreview } from './CheckoutSignInRuntimePreview';
import { CheckoutThankYouRuntimePreview } from './CheckoutThankYouRuntimePreview';
import type { CheckoutLogoPreviewConfig } from './CheckoutHeaderRuntimePreview';

type Props = {
  device: 'desktop' | 'mobile';
  storeId?: string | null;
  storeName?: string;
  storeUrl?: string | null;
  pageId?: CheckoutEditorPage;
  pageLabel?: string;
  headerPosition?: CheckoutHeaderPosition;
  footerConfig?: CheckoutFooterConfig;
  orderSummaryConfig?: CheckoutOrderSummaryConfig;
  signInMainConfig?: CheckoutSignInMainConfig;
  thankYouMainConfig?: CheckoutThankYouMainConfig;
  logo?: CheckoutLogoPreviewConfig;
  theme?: CheckoutPaletteTheme;
  typography?: CheckoutTypographyTheme;
  inputFieldsTransparent?: boolean;
  addressAutocompletion?: boolean;
  inspectorEnabled?: boolean;
  highlightNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
};

export function CheckoutProfilePreview({
  device,
  storeId,
  storeName = 'My Store',
  storeUrl,
  pageId = 'checkout',
  pageLabel = 'Checkout',
  headerPosition = 'checkout_form',
  footerConfig,
  orderSummaryConfig,
  signInMainConfig,
  thankYouMainConfig,
  logo,
  theme,
  typography,
  inputFieldsTransparent = false,
  addressAutocompletion = false,
  inspectorEnabled = true,
  highlightNodeId = null,
  onSelectNode,
}: Props) {
  const storefrontHref = storeUrl?.trim() || '#';
  const isMobile = device === 'mobile';

  const previewContent =
    pageId === 'checkout' ? (
      <CheckoutPageRuntimePreview
        pageId={pageId}
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
    ) : pageId === 'sign-in' ? (
      <CheckoutSignInRuntimePreview
        storeId={storeId}
        storeName={storeName}
        logo={logo}
        typography={typography}
        mainConfig={signInMainConfig}
        device={device}
      />
    ) : pageId === 'thank-you' ? (
      <CheckoutThankYouRuntimePreview
        device={device}
        storeId={storeId}
        storeName={storeName}
        storeUrl={storeUrl}
        headerPosition={headerPosition}
        mainConfig={thankYouMainConfig}
        footerConfig={footerConfig}
        orderSummaryConfig={orderSummaryConfig}
        logo={logo}
        theme={theme}
        typography={typography}
        highlightNodeId={highlightNodeId}
        onSelectNode={onSelectNode}
      />
    ) : pageId === 'orders' ? (
      <CheckoutOrdersRuntimePreview
        device={device}
        storeId={storeId}
        storeName={storeName}
        storeUrl={storeUrl}
        headerPosition={headerPosition}
        footerConfig={footerConfig}
        logo={logo}
        theme={theme}
        typography={typography}
        highlightNodeId={highlightNodeId}
        onSelectNode={onSelectNode}
      />
    ) : pageId === 'order-status' ? (
      <CheckoutOrderStatusRuntimePreview
        device={device}
        storeId={storeId}
        storeName={storeName}
        storeUrl={storeUrl}
        headerPosition={headerPosition}
        footerConfig={footerConfig}
        logo={logo}
        theme={theme}
        typography={typography}
        highlightNodeId={highlightNodeId}
        onSelectNode={onSelectNode}
      />
    ) : pageId === 'profile' ? (
      <CheckoutAccountProfileRuntimePreview
        device={device}
        storeId={storeId}
        storeName={storeName}
        storeUrl={storeUrl}
        headerPosition={headerPosition}
        footerConfig={footerConfig}
        logo={logo}
        theme={theme}
        typography={typography}
        highlightNodeId={highlightNodeId}
        onSelectNode={onSelectNode}
      />
    ) : null;

  return (
    <div className="pointer-events-auto flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#f1f1f1]">
      <div
        className={`pointer-events-auto mx-auto flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden ${
          isMobile ? 'max-w-[390px] border-x border-gray-200 bg-white shadow-sm' : 'bg-white'
        } ${inspectorEnabled ? 'checkout-preview-inspector-on' : ''}`}
      >
        {previewContent ?? (
          <div className="flex flex-1 items-center justify-center overflow-y-auto bg-white p-8">
            <div className="max-w-md text-center">
              <p className="text-[15px] leading-relaxed text-gray-700">
                Preview for <span className="font-medium text-gray-900">{pageLabel}</span> isn&apos;t
                available yet. Contact the store directly for help.
              </p>
              <a
                href={storefrontHref}
                className="mt-5 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
              >
                Return to store
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
