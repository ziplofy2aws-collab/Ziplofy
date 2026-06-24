import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { CheckoutFooterConfig, CheckoutPaletteTheme } from '../settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import { checkoutPreviewCurrencyCode, formatCheckoutPrice } from '../utils/format-checkout-price';
import { CheckoutFooterRuntimePreview } from '../preview/CheckoutFooterRuntimePreview';
import type { CheckoutOrderStatusDetails } from './checkout-order-status.types';

type Props = {
  storeId?: string | null;
  details: CheckoutOrderStatusDetails;
  device?: 'desktop' | 'mobile';
  theme?: CheckoutPaletteTheme;
  typography?: CheckoutTypographyTheme;
  footerConfig?: CheckoutFooterConfig;
  backHref?: string;
  highlightNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
};

function AccountNav({
  isMobile,
  headingsFontFamily,
  ordersHref = '/my-orders',
}: {
  isMobile: boolean;
  headingsFontFamily?: string;
  ordersHref?: string;
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
        <Link to={ordersHref} className="text-inherit no-underline hover:underline">
          Orders
        </Link>
      </h1>
      <Link to="/profile" className="mt-3 block text-[14px] text-[#707070] hover:underline">
        Profile
      </Link>
    </nav>
  );
}

function ProductThumbnail({
  imageUrl,
  gradient,
  quantity,
}: {
  imageUrl?: string | null;
  gradient: string;
  quantity: number;
}) {
  return (
    <div className="relative h-14 w-14 shrink-0">
      <div className="h-14 w-14 overflow-hidden rounded-md border border-[#e1e3e5] bg-white">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className={`h-full w-full bg-linear-to-br ${gradient}`} aria-hidden />
        )}
      </div>
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
    <div
      className={`flex items-start justify-between gap-4 text-[14px] ${
        bold ? 'font-semibold text-[#121212]' : 'text-[#121212]'
      }`}
    >
      <span className={bold ? '' : 'text-[#707070]'}>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-3 border-t border-[#dedede] py-4 first:border-t-0 first:pt-0 sm:grid-cols-[120px_1fr]">
      <p className="text-[14px] text-[#707070]">{label}</p>
      <div className="text-[14px] leading-relaxed text-[#121212]">{children}</div>
    </div>
  );
}

export function CheckoutOrderStatusContent({
  storeId,
  details,
  device = 'desktop',
  theme,
  typography,
  footerConfig,
  backHref = '/my-orders',
  highlightNodeId = null,
  onSelectNode,
}: Props) {
  const isMobile = device === 'mobile';
  const headingsFontFamily = typography?.headingsFontFamily;
  const buttonColor = theme?.buttonColor ?? theme?.accentColor ?? '#005bd3';
  const mainHighlighted = highlightNodeId === 'checkout:order-status:group:main';
  const currencyCode = checkoutPreviewCurrencyCode();
  const itemCount = details.lineItems.reduce((sum, item) => sum + item.quantity, 0);
  const selectable = Boolean(onSelectNode);

  const mainBody = (
    <div className={`${isMobile ? 'flex flex-col' : 'flex gap-10'}`}>
      <AccountNav isMobile={isMobile} headingsFontFamily={headingsFontFamily} ordersHref={backHref} />

      <div className="min-w-0 flex-1 space-y-4">
        <section data-checkout-node-id="checkout:order-status:main:page-header">
          <Link
            to={backHref}
            className="inline-flex items-center gap-1 text-[14px] font-medium text-[#121212] hover:underline"
          >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden />
            Order #{details.orderNumber}
          </Link>
          <p className="mt-2 text-[14px] text-[#707070]">Confirmed {details.confirmedDate}</p>
          <button
            type="button"
            className="mt-4 w-full rounded-md border border-[#dedede] bg-white px-4 py-3 text-[14px] font-medium sm:w-auto sm:min-w-[140px]"
            style={{ color: buttonColor }}
          >
            Buy again
          </button>
        </section>

        {details.showPaymentCard ? (
          <section
            className="rounded-lg border border-[#dedede] bg-white p-4 sm:p-5"
            data-checkout-node-id="checkout:order-status:main:payment-status"
          >
            <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'items-center justify-between'}`}>
              <div>
                <p className="text-[16px] font-semibold text-[#121212]">
                  {formatCheckoutPrice(details.amountDue)} {currencyCode}
                </p>
                <p className="mt-1 text-[14px] text-[#707070]">Payment due {details.dueDate}</p>
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
        ) : null}

        <section className="space-y-4" data-checkout-node-id="checkout:order-status:main:order-status">
          {details.lineItems.map((item) =>
            item.fulfillmentStatus === 'delivered' || item.fulfillmentStatus === 'shipped' ? (
              <article
                key={item.id}
                className="rounded-lg border border-[#dedede] bg-white p-4 sm:p-5"
              >
                <div className="flex gap-4">
                  <ProductThumbnail
                    imageUrl={item.imageUrl}
                    gradient={item.imageGradient}
                    quantity={item.quantity}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[16px] font-semibold text-[#121212]">
                        {item.headline ??
                          (item.fulfillmentStatus === 'shipped' ? 'On its way' : 'Delivered')}
                      </p>
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
                        <p className="text-[14px] font-medium text-[#121212]">
                          {item.fulfillmentStatus === 'shipped' ? 'On its way' : 'Delivered'}
                        </p>
                        <p className="mt-0.5 text-[13px] text-[#707070]">{item.statusDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ) : (
              <article
                key={item.id}
                className="rounded-lg border border-[#dedede] bg-white p-4 sm:p-5"
              >
                <div className="flex gap-4">
                  <ProductThumbnail
                    imageUrl={item.imageUrl}
                    gradient={item.imageGradient}
                    quantity={item.quantity}
                  />
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

        <section
          className="rounded-lg border border-[#dedede] bg-white p-4 sm:p-5"
          data-checkout-node-id="checkout:order-status:main:order-summary"
        >
          <div className="space-y-4">
            {details.lineItems.map((item) => (
              <div key={item.id} className="flex gap-4">
                <ProductThumbnail
                  imageUrl={item.imageUrl}
                  gradient={item.imageGradient}
                  quantity={item.quantity}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium leading-snug text-[#121212]">{item.title}</p>
                  <p className="mt-1 text-[13px] text-[#707070]">{item.variant}</p>
                </div>
                <p className="shrink-0 text-[14px] text-[#121212]">{formatCheckoutPrice(item.price)}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 border-t border-[#dedede] pt-4">
            <SummaryRow
              label={`Subtotal · ${itemCount} item${itemCount === 1 ? '' : 's'}`}
              value={formatCheckoutPrice(details.subtotal)}
            />
            <SummaryRow label="Shipping" value={details.shippingLabel} />
            <SummaryRow label="Total" value={formatCheckoutPrice(details.total)} bold />
            {details.amountPaid > 0 ? (
              <SummaryRow label="Paid" value={`-${formatCheckoutPrice(details.amountPaid)}`} />
            ) : null}
          </div>

          {details.amountDue > 0 ? (
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#dedede] pt-4 text-[14px] font-semibold text-[#121212]">
              <span>Due {details.dueDateLong}</span>
              <span>
                {currencyCode} {formatCheckoutPrice(details.amountDue)}
              </span>
            </div>
          ) : null}
        </section>

        <section
          className="rounded-lg border border-[#dedede] bg-white px-4 py-1 sm:px-5"
          data-checkout-node-id="checkout:order-status:main:order-details"
        >
          <DetailRow label="Contact">
            <p>{details.customerEmail}</p>
          </DetailRow>
          <DetailRow label="Ship to">
            {details.shippingAddressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </DetailRow>
          <DetailRow label="Method">
            <p>{details.shippingMethodLabel}</p>
          </DetailRow>
          <DetailRow label="Payment">
            {details.paymentMethodLabel.includes('Visa') ? (
              <div className="flex items-center gap-2">
                <span className="rounded border border-[#dedede] bg-[#f8fafc] px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-[#1a1f71]">
                  VISA
                </span>
                <span>{details.paymentMethodLabel}</span>
              </div>
            ) : (
              <p>{details.paymentMethodLabel}</p>
            )}
            {details.paymentDetailLine ? (
              <p className="mt-2 text-[#707070]">{details.paymentDetailLine}</p>
            ) : null}
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
  );

  return (
    <div
      className={`w-full ${isMobile ? 'px-4 py-6' : 'px-6 py-8 sm:px-8'} ${
        selectable ? 'cursor-pointer select-none' : ''
      } ${mainHighlighted ? 'ring-2 ring-inset ring-[#005bd3]' : ''}`}
      style={{ backgroundColor: theme?.mainBackgroundColor ?? '#ffffff' }}
      data-checkout-node-id="checkout:order-status:group:main"
      data-checkout-selectable={selectable ? 'true' : undefined}
      onClick={
        selectable
          ? (e) => {
              onSelectNode?.('checkout:order-status:group:main');
              e.stopPropagation();
            }
          : undefined
      }
      onKeyDown={
        selectable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectNode?.('checkout:order-status:group:main');
              }
            }
          : undefined
      }
      role={selectable ? 'button' : undefined}
      tabIndex={selectable ? 0 : undefined}
    >
      <div className={mainHighlighted ? 'pointer-events-none' : ''}>{mainBody}</div>
    </div>
  );
}
