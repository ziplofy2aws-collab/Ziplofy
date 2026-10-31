import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import type {
  CheckoutFooterConfig,
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

export type CheckoutThankYouDetails = {
  confirmationLabel: string;
  customerFirstName: string;
  email: string;
  paymentMethodLabel: string;
  shippingAddressLines: string[];
  billingAddressLines: string[];
  shippingMethodLabel: string;
};

type Props = {
  storeId?: string | null;
  theme?: CheckoutPaletteTheme;
  typography?: CheckoutTypographyTheme;
  device?: 'desktop' | 'mobile';
  footerConfig?: CheckoutFooterConfig;
  mainConfig?: CheckoutThankYouMainConfig;
  details: CheckoutThankYouDetails;
  highlightNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  continueShoppingHref?: string;
};

export function CheckoutThankYouMainContent({
  storeId,
  theme,
  typography,
  device = 'desktop',
  footerConfig,
  mainConfig,
  details,
  highlightNodeId = null,
  onSelectNode,
  continueShoppingHref = '/',
}: Props) {
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
  const selectable = Boolean(onSelectNode);

  return (
    <div
      className={`relative w-full ${isMobile ? 'px-4 py-6' : 'px-6 py-8 sm:px-8'} ${
        selectable ? 'cursor-pointer select-none' : ''
      } ${mainHighlighted ? 'ring-2 ring-inset ring-[#005bd3]' : ''}`}
      style={{
        backgroundColor,
        ...(bodyFontFamily ? { fontFamily: bodyFontFamily } : {}),
      }}
      data-checkout-node-id="checkout:thank-you:group:main"
      data-checkout-selectable={selectable ? 'true' : undefined}
      onClick={
        selectable
          ? (e) => {
              onSelectNode?.('checkout:thank-you:group:main');
              e.stopPropagation();
            }
          : undefined
      }
      onKeyDown={
        selectable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectNode?.('checkout:thank-you:group:main');
              }
            }
          : undefined
      }
      role={selectable ? 'button' : undefined}
      tabIndex={selectable ? 0 : undefined}
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
            <p className="text-[14px] text-[#707070]">Confirmation {details.confirmationLabel}</p>
            <h1
              className="mt-1 text-[28px] font-semibold leading-tight text-[#121212]"
              style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
            >
              Thank you, {details.customerFirstName}!
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
              {details.email}
            </p>
          </div>
          <div>
            <p className="font-medium text-[#707070]">Payment method</p>
            <p className="mt-1">{details.paymentMethodLabel}</p>
          </div>
          <div>
            <p className="font-medium text-[#707070]">Shipping address</p>
            <p className="mt-1 leading-relaxed">
              {details.shippingAddressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
          <div>
            <p className="font-medium text-[#707070]">Billing address</p>
            <p className="mt-1 leading-relaxed">
              {details.billingAddressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
          <div className={isMobile ? '' : 'col-span-2'}>
            <p className="font-medium text-[#707070]">Shipping method</p>
            <p className="mt-1">{details.shippingMethodLabel}</p>
          </div>
        </div>

        <div className={`mt-8 flex ${isMobile ? 'justify-stretch' : 'justify-end'}`}>
          <Link
            to={continueShoppingHref}
            className={`inline-flex items-center justify-center rounded-md px-5 py-3.5 text-[14px] font-medium text-white ${
              isMobile ? 'w-full' : ''
            }`}
            style={{ backgroundColor: buttonColor }}
          >
            Continue shopping
          </Link>
        </div>

        {(footerConfig?.location ?? 'checkout_form') !== 'full_width' ? (
          <CheckoutFooterRuntimePreview
            storeId={storeId}
            alignment={footerConfig?.alignment ?? 'left'}
            accentColor={theme?.accentColor}
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

export const CHECKOUT_THANK_YOU_PREVIEW_DETAILS: CheckoutThankYouDetails = {
  confirmationLabel: '#ABC123EXAMPLE',
  customerFirstName: 'Eino',
  email: 'eino.metz@example.com',
  paymentMethodLabel: 'Cash on Delivery (COD)',
  shippingAddressLines: ['Eino Metz', 'Netaji Subhash Marg', 'Lal Qila, Chandni Chowk', 'New Delhi 110006', 'India'],
  billingAddressLines: ['Eino Metz', 'Netaji Subhash Marg', 'Lal Qila, Chandni Chowk', 'New Delhi 110006', 'India'],
  shippingMethodLabel: 'Standard (Example)',
};
