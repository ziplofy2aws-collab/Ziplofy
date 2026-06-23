import { CheckCircleIcon } from '@heroicons/react/24/solid';
import React from 'react';
import type {
  CheckoutFooterConfig,
  CheckoutHeaderPosition,
  CheckoutOrderSummaryConfig,
  CheckoutPaletteTheme,
  CheckoutThankYouMainConfig,
} from '../settings/checkout-settings.types';
import {
  CHECKOUT_DEFAULT_THANK_YOU_MAIN_ACCENT,
  CHECKOUT_DEFAULT_THANK_YOU_MAIN_BACKGROUND,
  CHECKOUT_FORM_MAX_WIDTH_CLASS,
  resolveCheckoutColorSetting,
} from '../settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import { CheckoutFooterRuntimePreview } from './CheckoutFooterRuntimePreview';
import { CheckoutHeaderRuntimePreview, type CheckoutLogoPreviewConfig } from './CheckoutHeaderRuntimePreview';
import { CheckoutOrderSummaryRuntimePreview } from './CheckoutOrderSummaryRuntimePreview';
import { CheckoutTypographyFontLoader } from './CheckoutTypographyFontLoader';

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

const EXAMPLE_CONFIRMATION = '#ABC123EXAMPLE';
const EXAMPLE_CUSTOMER = 'Isidro';
const EXAMPLE_EMAIL = 'isidro@example.com';

function ThankYouMainContent({
  theme,
  typography,
  device,
  footerConfig,
  mainConfig,
  highlightNodeId,
  onSelectNode,
}: {
  theme?: CheckoutPaletteTheme;
  typography?: CheckoutTypographyTheme;
  device: PreviewDevice;
  footerConfig?: CheckoutFooterConfig;
  mainConfig?: CheckoutThankYouMainConfig;
  highlightNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
}) {
  const isMobile = device === 'mobile';
  const headingsFontFamily = typography?.headingsFontFamily;
  const bodyFontFamily = typography?.bodyFontFamily;
  const backgroundColor = resolveCheckoutColorSetting(
    mainConfig?.backgroundColor ?? theme?.mainBackgroundColor ?? 'default',
    CHECKOUT_DEFAULT_THANK_YOU_MAIN_BACKGROUND
  );
  const accentColor = resolveCheckoutColorSetting(
    mainConfig?.accentColor ?? theme?.accentColor ?? 'default',
    CHECKOUT_DEFAULT_THANK_YOU_MAIN_ACCENT
  );
  const backgroundImage = mainConfig?.backgroundImage?.trim() || null;
  const buttonColor = theme?.buttonColor ?? accentColor;
  const mainHighlighted = highlightNodeId === 'checkout:thank-you:group:main';

  return (
    <div
      className={`relative w-full select-none ${
        isMobile ? 'px-4 py-6' : 'px-6 py-8 sm:px-8'
      } ${onSelectNode ? 'cursor-pointer' : ''} ${
        mainHighlighted ? 'ring-2 ring-inset ring-[#005bd3]' : ''
      }`}
      style={{
        backgroundColor,
        ...(bodyFontFamily ? { fontFamily: bodyFontFamily } : {}),
      }}
      data-checkout-node-id="checkout:thank-you:group:main"
      data-checkout-selectable={onSelectNode ? 'true' : undefined}
      onClick={(e) => {
        onSelectNode?.('checkout:thank-you:group:main');
        e.stopPropagation();
      }}
      onKeyDown={(e) => {
        if (!onSelectNode) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectNode('checkout:thank-you:group:main');
        }
      }}
      role={onSelectNode ? 'button' : undefined}
      tabIndex={onSelectNode ? 0 : undefined}
    >
      {backgroundImage ? (
        <>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.62,
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor, opacity: 0.7 }}
            aria-hidden
          />
        </>
      ) : null}
      <div
        className={`relative mx-auto w-full ${CHECKOUT_FORM_MAX_WIDTH_CLASS} ${
          mainHighlighted ? 'pointer-events-none' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <CheckCircleIcon className="mt-0.5 h-7 w-7 shrink-0" style={{ color: accentColor }} aria-hidden />
          <div className="min-w-0">
            <p className="text-[14px] text-[#707070]">Confirmation {EXAMPLE_CONFIRMATION}</p>
            <h1
              className="mt-1 text-[28px] font-semibold leading-tight text-[#121212]"
              style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
            >
              Thank you, {EXAMPLE_CUSTOMER}!
            </h1>
          </div>
        </div>

        <div className="mt-6 rounded-md border border-[#dedede] bg-white p-5">
          <p
            className="text-[16px] font-semibold text-[#121212]"
            style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
          >
            Your order is confirmed
          </p>
          <p className="mt-1 text-[14px] text-[#707070]">
            You&apos;ll receive a confirmation email soon.
          </p>
          <label className="mt-4 flex cursor-default items-start gap-2.5 text-[14px] text-[#121212]">
            <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border border-[#dedede] bg-white" />
            <span className="leading-snug">Email me with news and offers</span>
          </label>
        </div>

        <h2
          className="mt-8 text-[16px] font-semibold text-[#121212]"
          style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
        >
          Order details
        </h2>

        <div
          className={`mt-4 grid gap-6 text-[14px] text-[#121212] ${
            isMobile ? 'grid-cols-1' : 'grid-cols-2'
          }`}
        >
          <div>
            <p className="font-medium text-[#707070]">Contact information</p>
            <p
              className="mt-1 underline"
              style={{ color: accentColor, textDecorationColor: accentColor }}
            >
              {EXAMPLE_EMAIL}
            </p>
          </div>
          <div>
            <p className="font-medium text-[#707070]">Payment method</p>
            <p className="mt-1">Cash on Delivery (COD)</p>
          </div>
          <div>
            <p className="font-medium text-[#707070]">Shipping address</p>
            <p className="mt-1 leading-relaxed">
              {EXAMPLE_CUSTOMER} Example
              <br />
              123 Example Street
              <br />
              New Delhi 110001
              <br />
              India
            </p>
          </div>
          <div>
            <p className="font-medium text-[#707070]">Billing address</p>
            <p className="mt-1 leading-relaxed">
              {EXAMPLE_CUSTOMER} Example
              <br />
              123 Example Street
              <br />
              New Delhi 110001
              <br />
              India
            </p>
          </div>
          <div className={isMobile ? '' : 'col-span-2'}>
            <p className="font-medium text-[#707070]">Shipping method</p>
            <p className="mt-1">Standard (Example)</p>
          </div>
        </div>

        <div className={`mt-8 flex ${isMobile ? 'justify-stretch' : 'justify-end'}`}>
          <button
            type="button"
            className={`rounded-md px-5 py-3.5 text-[14px] font-medium text-white ${
              isMobile ? 'w-full' : ''
            }`}
            style={{ backgroundColor: buttonColor }}
          >
            Continue shopping
          </button>
        </div>

        {(footerConfig?.location ?? 'checkout_form') !== 'full_width' ? (
          <CheckoutFooterRuntimePreview
            alignment={footerConfig?.alignment ?? 'left'}
            device={device}
            highlightNodeId={highlightNodeId}
            onSelectNode={onSelectNode}
            constrained
          />
        ) : null}
      </div>
    </div>
  );
}

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
  const isMobile = device === 'mobile';
  const isFullWidthHeader = headerPosition === 'full_width';
  const isFullWidthFooter = (footerConfig?.location ?? 'checkout_form') === 'full_width';

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
          ? 'w-full shrink-0 border-b border-[#e1e3e5] bg-[#fafafa]'
          : 'sticky top-0 w-[42%] max-w-[480px] shrink-0 self-start border-l border-[#e1e3e5] bg-[#fafafa]'
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

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <CheckoutTypographyFontLoader
        fonts={[typography?.headingGoogleFont, typography?.bodyGoogleFont]}
      />

      {isFullWidthHeader ? headerSlot : null}

      <div className="checkout-preview-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div
          className={`mx-auto flex w-full ${
            isMobile ? 'max-w-none flex-col' : 'min-h-full flex-row items-start'
          }`}
        >
          {isMobile ? orderSummarySlot : null}

          <div className="min-w-0 flex-1">
            {!isFullWidthHeader ? headerSlot : null}
            <ThankYouMainContent
              theme={theme}
              typography={typography}
              device={device}
              footerConfig={footerConfig}
              mainConfig={mainConfig}
              highlightNodeId={highlightNodeId}
              onSelectNode={onSelectNode}
            />
          </div>

          {!isMobile ? orderSummarySlot : null}
        </div>
      </div>

      {isFullWidthFooter ? (
        <CheckoutFooterRuntimePreview
          alignment={footerConfig?.alignment ?? 'left'}
          device={device}
          highlightNodeId={highlightNodeId}
          onSelectNode={onSelectNode}
        />
      ) : null}
    </div>
  );
}
