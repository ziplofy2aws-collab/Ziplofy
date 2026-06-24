import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { formatINR } from '@render-store/sdk';
import type {
  CheckoutFooterConfig,
  CheckoutHeaderPosition,
  CheckoutOrderSummaryConfig,
  CheckoutPaletteTheme,
  CheckoutThankYouMainConfig,
} from './settings/checkout-settings.types';
import {
  CHECKOUT_DEFAULT_THANK_YOU_MAIN_ACCENT,
  CHECKOUT_DEFAULT_THANK_YOU_MAIN_BACKGROUND,
  CHECKOUT_FORM_MAX_WIDTH_CLASS,
  resolveCheckoutColorSetting,
} from './settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from './settings/checkout-typography-fonts';
import { CheckoutFooterRuntimePreview } from './preview/CheckoutFooterRuntimePreview';
import { CheckoutHeaderRuntimePreview, type CheckoutLogoPreviewConfig } from './preview/CheckoutHeaderRuntimePreview';
import { CheckoutTypographyFontLoader } from './preview/CheckoutTypographyFontLoader';
import { checkoutPreviewCurrencyCode } from './utils/format-checkout-price';

export type CheckoutThankYouOrderSummary = {
  confirmationLabel: string;
  customerFirstName: string;
  email: string;
  paymentMethodLabel: string;
  shippingAddressLines: string[];
  total: number;
};

type Props = {
  device?: 'desktop' | 'mobile';
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
  order: CheckoutThankYouOrderSummary;
};

export function CheckoutThankYouView({
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
  order,
}: Props) {
  const isMobile = device === 'mobile';
  const isFullWidthHeader = headerPosition === 'full_width';
  const isFullWidthFooter = (footerConfig?.location ?? 'checkout_form') === 'full_width';
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

  const mainContent = (
    <div
      className={`relative w-full ${isMobile ? 'px-4 py-6' : 'px-6 py-8 sm:px-8'}`}
      style={{
        backgroundColor,
        ...(bodyFontFamily ? { fontFamily: bodyFontFamily } : {}),
      }}
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

      <div className={`relative mx-auto w-full ${CHECKOUT_FORM_MAX_WIDTH_CLASS}`}>
        <div className="flex items-start gap-3">
          <CheckCircleIcon className="mt-0.5 h-7 w-7 shrink-0" style={{ color: accentColor }} aria-hidden />
          <div className="min-w-0">
            <p className="text-[14px] text-[#707070]">Confirmation {order.confirmationLabel}</p>
            <h1
              className="mt-1 text-[28px] font-semibold leading-tight text-[#121212]"
              style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
            >
              Thank you, {order.customerFirstName}!
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
            You&apos;ll receive a confirmation email at {order.email}.
          </p>
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
            <p className="mt-1 underline" style={{ color: accentColor, textDecorationColor: accentColor }}>
              {order.email}
            </p>
          </div>
          <div>
            <p className="font-medium text-[#707070]">Payment method</p>
            <p className="mt-1">{order.paymentMethodLabel}</p>
          </div>
          <div>
            <p className="font-medium text-[#707070]">Shipping address</p>
            <p className="mt-1 leading-relaxed">
              {order.shippingAddressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
          <div>
            <p className="font-medium text-[#707070]">Total</p>
            <p className="mt-1 tabular-nums">
              {checkoutPreviewCurrencyCode()} {formatINR(order.total)}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/my-orders"
            className="inline-flex rounded-[5px] px-5 py-3 text-[14px] font-medium text-white"
            style={{ backgroundColor: buttonColor }}
          >
            View orders
          </Link>
          <Link
            to="/"
            className="inline-flex rounded-[5px] border border-[#dedede] bg-white px-5 py-3 text-[14px] font-medium text-[#121212]"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <CheckoutTypographyFontLoader fonts={[typography?.headingGoogleFont, typography?.bodyGoogleFont]} />
      {isFullWidthHeader ? (
        <div className="shrink-0 border-b border-[#e1e3e5]" style={{ backgroundColor: theme?.headerBackgroundColor ?? '#ffffff' }}>
          <CheckoutHeaderRuntimePreview
            storeName={storeName}
            storeUrl={storeUrl}
            logo={logo}
            theme={theme}
            device={device}
          />
        </div>
      ) : null}

      <div className={`mx-auto flex w-full ${isMobile ? 'max-w-none flex-col' : 'flex-row items-start'}`}>
        <div className="min-w-0 flex-1">
          {!isFullWidthHeader ? (
            <div
              className="shrink-0 border-b border-[#e1e3e5]"
              style={{ backgroundColor: theme?.headerBackgroundColor ?? '#ffffff' }}
            >
              <div className={`mx-auto w-full ${CHECKOUT_FORM_MAX_WIDTH_CLASS}`}>
                <CheckoutHeaderRuntimePreview
                  storeName={storeName}
                  storeUrl={storeUrl}
                  logo={logo}
                  theme={theme}
                  device={device}
                />
              </div>
            </div>
          ) : null}
          {mainContent}
          {!isFullWidthFooter ? (
            <CheckoutFooterRuntimePreview
              storeId={storeId}
              alignment={footerConfig?.alignment ?? 'left'}
              device={device}
              constrained={!isMobile}
              accentColor={accentColor}
            />
          ) : null}
        </div>

        {!isMobile && orderSummaryConfig ? (
          <div
            className="w-[42%] max-w-[480px] shrink-0 self-start border-l border-[#e1e3e5] bg-[#fafafa] p-6 sm:p-8"
            style={{ backgroundColor: orderSummaryConfig.backgroundColor ?? '#fafafa' }}
          >
            <p className="text-[14px] font-medium text-[#121212]">Order summary</p>
            <div className="mt-4 flex items-end justify-between gap-4 border-t border-[#e1e3e5] pt-5">
              <span className="text-[18px] font-semibold text-[#121212]">Total</span>
              <span className="text-[22px] font-semibold tabular-nums text-[#121212]">
                {formatINR(order.total)}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {isFullWidthFooter ? (
        <CheckoutFooterRuntimePreview
          storeId={storeId}
          alignment={footerConfig?.alignment ?? 'left'}
          device={device}
          accentColor={accentColor}
        />
      ) : null}
    </div>
  );
}
