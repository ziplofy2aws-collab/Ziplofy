import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import React, { useMemo } from 'react';
import { useCheckoutPreviewProduct } from '../hooks/useCheckoutPreviewProduct';
import type { CheckoutOrderSummaryConfig } from '../settings/checkout-settings.types';
import {
  CHECKOUT_DEFAULT_ORDER_SUMMARY_ACCENT,
  CHECKOUT_DEFAULT_ORDER_SUMMARY_BACKGROUND,
  resolveCheckoutColorSetting,
} from '../settings/checkout-settings.types';
import { checkoutPreviewCurrencyCode, formatCheckoutPrice } from '../utils/format-checkout-price';

const PREVIEW_SHIPPING_AMOUNT = 10;
const PREVIEW_QUANTITY = 1;

type Props = {
  storeId?: string | null;
  orderSummaryConfig?: CheckoutOrderSummaryConfig;
  highlightNodeId?: string | null;
};

function SummaryRow({
  label,
  value,
  showInfo,
}: {
  label: string;
  value: string;
  showInfo?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-[14px] text-[#121212]">
      <span className="inline-flex items-center gap-1.5">
        <span>{label}</span>
        {showInfo ? <QuestionMarkCircleIcon className="h-4 w-4 text-[#8a8a8a]" aria-hidden /> : null}
      </span>
      <span className="shrink-0 tabular-nums">{value}</span>
    </div>
  );
}

function ProductImagePlaceholder() {
  return <div className="h-full w-full bg-linear-to-br from-[#f3e8ff] via-[#fce7f3] to-[#fef3c7]" />;
}

export function CheckoutOrderSummaryRuntimePreview({
  storeId,
  orderSummaryConfig,
  highlightNodeId = null,
}: Props) {
  const { product, loading } = useCheckoutPreviewProduct(storeId);

  const backgroundColor = resolveCheckoutColorSetting(
    orderSummaryConfig?.backgroundColor ?? 'default',
    CHECKOUT_DEFAULT_ORDER_SUMMARY_BACKGROUND
  );
  const accentColor = resolveCheckoutColorSetting(
    orderSummaryConfig?.accentColor ?? 'default',
    CHECKOUT_DEFAULT_ORDER_SUMMARY_ACCENT
  );
  const backgroundImage = orderSummaryConfig?.backgroundImage?.trim() || null;
  const sectionHighlighted = highlightNodeId === 'checkout:order-summary';

  const lineItem = useMemo(() => {
    const unitPrice = product?.price ?? 0;
    const subtotal = unitPrice * PREVIEW_QUANTITY;
    const total = subtotal + PREVIEW_SHIPPING_AMOUNT;

    return {
      title: product?.title ?? (loading ? 'Loading product...' : 'Add a product to preview your cart'),
      imageUrl: product?.imageUrl ?? null,
      quantity: PREVIEW_QUANTITY,
      unitPriceFormatted: product ? formatCheckoutPrice(unitPrice) : formatCheckoutPrice(0),
      subtotalFormatted: formatCheckoutPrice(subtotal),
      shippingFormatted: formatCheckoutPrice(PREVIEW_SHIPPING_AMOUNT),
      totalFormatted: formatCheckoutPrice(total),
    };
  }, [product, loading]);

  return (
    <aside
      className="relative flex h-full min-h-0 flex-col p-6 sm:p-8"
      style={{
        backgroundColor,
        ...(sectionHighlighted ? { boxShadow: `inset 0 0 0 2px ${accentColor}` } : {}),
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

      <div className="relative z-10 flex gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#e1e3e5] bg-white">
          {lineItem.imageUrl ? (
            <img src={lineItem.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <ProductImagePlaceholder />
          )}
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#121212] px-1 text-[11px] font-medium text-white">
            {lineItem.quantity}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-[14px] font-medium leading-snug text-[#121212] ${loading ? 'text-[#707070]' : ''}`}>
            {lineItem.title}
          </p>
        </div>

        <div className="shrink-0 pt-0.5 text-[14px] tabular-nums text-[#121212]">{lineItem.unitPriceFormatted}</div>
      </div>

      <div className="relative z-10 mt-8 space-y-3">
        <SummaryRow label="Subtotal" value={lineItem.subtotalFormatted} />
        <SummaryRow label="Shipping" value={lineItem.shippingFormatted} showInfo />
      </div>

      <div className="relative z-10 mt-8 flex items-end justify-between gap-4 border-t border-[#e1e3e5] pt-5">
        <span className="text-[18px] font-semibold text-[#121212]">Total</span>
        <div className="flex items-baseline gap-2">
          <span className="text-[12px] font-medium uppercase tracking-wide text-[#8a8a8a]">
            {checkoutPreviewCurrencyCode()}
          </span>
          <span className="text-[22px] font-semibold leading-none tabular-nums text-[#121212]">
            {lineItem.totalFormatted}
          </span>
        </div>
      </div>
    </aside>
  );
}
