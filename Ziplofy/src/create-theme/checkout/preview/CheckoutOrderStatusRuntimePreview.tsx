import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import type { CheckoutFooterConfig, CheckoutHeaderPosition, CheckoutPaletteTheme } from '../settings/checkout-settings.types';
import { CHECKOUT_FORM_MAX_WIDTH_CLASS } from '../settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import { checkoutPreviewCurrencyCode, formatCheckoutPrice } from '../utils/format-checkout-price';
import { CheckoutFooterRuntimePreview } from './CheckoutFooterRuntimePreview';
import { CheckoutHeaderRuntimePreview, type CheckoutLogoPreviewConfig } from './CheckoutHeaderRuntimePreview';
import { CheckoutTypographyFontLoader } from './CheckoutTypographyFontLoader';

type PreviewDevice = 'desktop' | 'mobile';

const ORDER_NUMBER = '1004';
const CONFIRMED_DATE = '13 Jun';
const DUE_DATE = '22 Jul';
const DUE_DATE_LONG = '22 July';
const DELIVERED_DATE = '21 Jun';
const PAYMENT_DATE = '23 Jun';
const CUSTOMER_NAME = 'Gerson Blanda';
const CUSTOMER_EMAIL = 'gerson.blanda@example.com';
const CUSTOMER_PHONE = '+91 11 2327 7705';

const LINE_ITEMS = [
  {
    id: '1',
    title: 'Powerful 7 Chakra Stone Frame | Healing Gemstone Wall Hanging for Positive Energy & Balance',
    variant: 'Default Title',
    price: 999,
    quantity: 1,
    gradient: 'from-[#f3e8ff] via-[#fce7f3] to-[#fef3c7]',
    status: 'delivered' as const,
    statusDate: DELIVERED_DATE,
    headline: 'Arrived 21 Jun',
  },
  {
    id: '2',
    title: 'Seven Chakra Diary - with 7 Authentic Semi Precious Stones',
    variant: 'Default Title',
    price: 799,
    quantity: 1,
    gradient: 'from-[#fde68a] via-[#fcd34d] to-[#d97706]',
    status: 'confirmed' as const,
    statusDate: CONFIRMED_DATE,
    headline: null,
  },
];

const SUBTOTAL = 1798;
const AMOUNT_PAID = 899;
const AMOUNT_DUE = 899;

type Props = {
  device?: PreviewDevice;
  storeId?: string | null;
  storeName?: string;
  storeUrl?: string | null;
  headerPosition?: CheckoutHeaderPosition;
  footerConfig?: CheckoutFooterConfig;
  logo?: CheckoutLogoPreviewConfig;
  theme?: CheckoutPaletteTheme;
  typography?: CheckoutTypographyTheme;
  highlightNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
};

function AccountNav({
  isMobile,
  headingsFontFamily,
}: {
  isMobile: boolean;
  headingsFontFamily?: string;
}) {
  return (
    <nav
      className={`shrink-0 ${isMobile ? 'mb-6 border-b border-[#dedede] pb-4' : 'w-[148px]'}`}
      aria-label="Account"
    >
      <h1
        className={`font-semibold leading-tight text-[#121212] ${isMobile ? 'text-[24px]' : 'text-[28px]'}`}
        style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
      >
        Orders
      </h1>
      <span className="mt-3 block text-[14px] text-[#707070]">Profile</span>
    </nav>
  );
}

function ProductThumbnail({
  gradient,
  quantity,
}: {
  gradient: string;
  quantity: number;
}) {
  return (
    <div className="relative h-14 w-14 shrink-0">
      <div className={`h-14 w-14 rounded-md bg-linear-to-br ${gradient}`} aria-hidden />
      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#121212] px-1 text-[11px] font-medium text-white">
        {quantity}
      </span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 text-[14px] ${bold ? 'font-semibold text-[#121212]' : 'text-[#121212]'}`}>
      <span className={bold ? '' : 'text-[#707070]'}>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={`grid gap-3 border-t border-[#dedede] py-4 first:border-t-0 first:pt-0 ${'sm:grid-cols-[120px_1fr]'}`}>
      <p className="text-[14px] text-[#707070]">{label}</p>
      <div className="text-[14px] leading-relaxed text-[#121212]">{children}</div>
    </div>
  );
}

export function CheckoutOrderStatusRuntimePreview({
  device = 'desktop',
  storeId,
  storeName = 'My Store',
  storeUrl,
  headerPosition = 'checkout_form',
  footerConfig,
  logo,
  theme,
  typography,
  highlightNodeId,
  onSelectNode,
}: Props) {
  const isMobile = device === 'mobile';
  const isFullWidthHeader = headerPosition === 'full_width';
  const isFullWidthFooter = (footerConfig?.location ?? 'checkout_form') === 'full_width';
  const headingsFontFamily = typography?.headingsFontFamily;
  const bodyFontFamily = typography?.bodyFontFamily;
  const buttonColor = theme?.buttonColor ?? '#005bd3';
  const mainHighlighted = highlightNodeId === 'checkout:order-status:group:main';
  const currencyCode = checkoutPreviewCurrencyCode();

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

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <CheckoutTypographyFontLoader
        fonts={[typography?.headingGoogleFont, typography?.bodyGoogleFont]}
      />

      {isFullWidthHeader ? headerSlot : null}

      <div className="checkout-preview-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div
          className={`mx-auto w-full ${isMobile ? 'max-w-none' : CHECKOUT_FORM_MAX_WIDTH_CLASS}`}
          style={bodyFontFamily ? { fontFamily: bodyFontFamily } : undefined}
        >
          {!isFullWidthHeader ? headerSlot : null}

          <div
            className={`w-full select-none ${isMobile ? 'px-4 py-6' : 'px-6 py-8 sm:px-8'} ${
              onSelectNode ? 'cursor-pointer' : ''
            } ${mainHighlighted ? 'ring-2 ring-inset ring-[#005bd3]' : ''}`}
            style={{ backgroundColor: theme?.mainBackgroundColor ?? '#ffffff' }}
            data-checkout-node-id="checkout:order-status:group:main"
            data-checkout-selectable={onSelectNode ? 'true' : undefined}
            onClick={(e) => {
              onSelectNode?.('checkout:order-status:group:main');
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              if (!onSelectNode) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectNode('checkout:order-status:group:main');
              }
            }}
            role={onSelectNode ? 'button' : undefined}
            tabIndex={onSelectNode ? 0 : undefined}
          >
            <div
              className={`${isMobile ? 'flex flex-col' : 'flex gap-10'} ${
                mainHighlighted ? 'pointer-events-none' : ''
              }`}
            >
              <AccountNav isMobile={isMobile} headingsFontFamily={headingsFontFamily} />

              <div className="min-w-0 flex-1 space-y-4">
                {/* Page header */}
                <section data-checkout-node-id="checkout:order-status:main:page-header">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[14px] text-[#121212] hover:underline"
                  >
                    <ChevronLeftIcon className="h-4 w-4" aria-hidden />
                    Order #{ORDER_NUMBER}
                  </button>
                  <p className="mt-2 text-[14px] text-[#707070]">Confirmed {CONFIRMED_DATE}</p>
                  <button
                    type="button"
                    className="mt-4 w-full rounded-md border border-[#dedede] bg-white px-4 py-3 text-[14px] font-medium text-[#121212] sm:w-auto sm:min-w-[140px]"
                  >
                    Buy again
                  </button>
                </section>

                {/* Payment status */}
                <section
                  className="rounded-md border border-[#dedede] bg-white p-4"
                  data-checkout-node-id="checkout:order-status:main:payment-status"
                >
                  <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'items-center justify-between'}`}>
                    <div>
                      <p className="text-[16px] font-semibold text-[#121212]">
                        {formatCheckoutPrice(AMOUNT_DUE)} {currencyCode}
                      </p>
                      <p className="mt-1 text-[14px] text-[#707070]">Payment due {DUE_DATE}</p>
                    </div>
                    <button
                      type="button"
                      className={`rounded-md px-5 py-2.5 text-[14px] font-medium text-white ${
                        isMobile ? 'w-full' : 'shrink-0'
                      }`}
                      style={{ backgroundColor: buttonColor }}
                    >
                      Pay now
                    </button>
                  </div>
                </section>

                {/* Fulfillment status cards */}
                <section className="space-y-4" data-checkout-node-id="checkout:order-status:main:order-status">
                  {LINE_ITEMS.map((item) =>
                    item.status === 'delivered' ? (
                      <article
                        key={item.id}
                        className="rounded-md border border-[#dedede] bg-white p-4"
                      >
                        <div className="flex gap-4">
                          <ProductThumbnail gradient={item.gradient} quantity={item.quantity} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-[16px] font-semibold text-[#121212]">{item.headline}</p>
                              <button
                                type="button"
                                className="inline-flex shrink-0 items-center gap-1 text-[13px] text-[#707070]"
                              >
                                Show details
                                <ChevronDownIcon className="h-4 w-4" aria-hidden />
                              </button>
                            </div>
                            <div className="mt-4 flex gap-3">
                              <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#707070]" aria-hidden />
                              <div>
                                <p className="text-[14px] font-medium text-[#121212]">Delivered</p>
                                <p className="mt-0.5 text-[13px] text-[#707070]">{item.statusDate}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    ) : (
                      <article
                        key={item.id}
                        className="rounded-md border border-[#dedede] bg-white p-4"
                      >
                        <div className="flex gap-4">
                          <ProductThumbnail gradient={item.gradient} quantity={item.quantity} />
                          <div className="min-w-0 flex-1">
                            <div className="flex gap-3">
                              <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#707070]" aria-hidden />
                              <div>
                                <p className="text-[14px] font-medium text-[#121212]">Confirmed</p>
                                <p className="mt-1 text-[14px] text-[#707070]">
                                  We&apos;re preparing these items for shipping.
                                </p>
                                <p className="mt-2 text-[13px] text-[#b5b5b5]">{item.statusDate}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </section>

                {/* Order summary */}
                <section
                  className="rounded-md border border-[#dedede] bg-white p-4"
                  data-checkout-node-id="checkout:order-status:main:order-summary"
                >
                  <div className="space-y-4">
                    {LINE_ITEMS.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <ProductThumbnail gradient={item.gradient} quantity={item.quantity} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-medium leading-snug text-[#121212]">{item.title}</p>
                          <p className="mt-1 text-[13px] text-[#707070]">{item.variant}</p>
                        </div>
                        <p className="shrink-0 text-[14px] text-[#121212]">{formatCheckoutPrice(item.price)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 space-y-3 border-t border-[#dedede] pt-4">
                    <SummaryRow label="Subtotal · 2 items" value={formatCheckoutPrice(SUBTOTAL)} />
                    <SummaryRow label="Shipping" value="Free" />
                    <SummaryRow label="Total" value={formatCheckoutPrice(SUBTOTAL)} bold />
                    <SummaryRow label="Paid" value={`-${formatCheckoutPrice(AMOUNT_PAID)}`} />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#dedede] pt-4 text-[14px] font-semibold text-[#121212]">
                    <span>Due {DUE_DATE_LONG}</span>
                    <span>
                      {currencyCode} {formatCheckoutPrice(AMOUNT_DUE)}
                    </span>
                  </div>
                </section>

                {/* Customer information */}
                <section
                  className="rounded-md border border-[#dedede] bg-white px-4 py-1"
                  data-checkout-node-id="checkout:order-status:main:order-details"
                >
                  <DetailRow label="Contact">
                    <p>{CUSTOMER_EMAIL}</p>
                  </DetailRow>
                  <DetailRow label="Ship to">
                    <p>{CUSTOMER_NAME}</p>
                    <p>Netaji Subhash Marg</p>
                    <p>Lal Qila, Chandni Chowk</p>
                    <p>110006 New Delhi Delhi</p>
                    <p>India</p>
                    <p className="mt-2">{CUSTOMER_PHONE}</p>
                  </DetailRow>
                  <DetailRow label="Method">
                    <p>Standard (Example)</p>
                  </DetailRow>
                  <DetailRow label="Payment">
                    <div className="flex items-center gap-2">
                      <span className="rounded border border-[#dedede] bg-[#f8fafc] px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-[#1a1f71]">
                        VISA
                      </span>
                      <span>Visa · 4242</span>
                    </div>
                    <p className="mt-2 text-[#707070]">
                      {formatCheckoutPrice(AMOUNT_PAID)} {currencyCode} · {PAYMENT_DATE}
                    </p>
                  </DetailRow>
                </section>

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
          </div>
        </div>
      </div>

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
