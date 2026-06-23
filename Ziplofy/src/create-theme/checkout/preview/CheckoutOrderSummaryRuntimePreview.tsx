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
  layout?: 'desktop' | 'mobile';
  onSelectNode?: (nodeId: string) => void;
};

function SummaryRow({
  label,
  value,
  showInfo,
  compact = false,
}: {
  label: string;
  value: string;
  showInfo?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 text-[#121212] ${
        compact ? 'text-[13px]' : 'text-[14px]'
      }`}
    >
      <span className="inline-flex min-w-0 items-center gap-1.5">
        <span>{label}</span>
        {showInfo ? <QuestionMarkCircleIcon className="h-4 w-4 shrink-0 text-[#8a8a8a]" aria-hidden /> : null}
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
  layout = 'desktop',
  onSelectNode,
}: Props) {
  const { product, loading } = useCheckoutPreviewProduct(storeId);
  const isMobile = layout === 'mobile';

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
      className={`relative flex min-h-0 flex-col pointer-events-auto ${
        isMobile ? 'w-full shrink-0 p-4' : 'p-6 sm:p-8'
      } ${onSelectNode ? 'cursor-pointer' : ''}`}
      style={{
        backgroundColor,
        ...(sectionHighlighted ? { boxShadow: `inset 0 0 0 2px ${accentColor}` } : {}),
      }}
      data-checkout-node-id="checkout:order-summary"
      data-checkout-selectable={onSelectNode ? 'true' : undefined}
      onClick={(e) => {
        onSelectNode?.('checkout:order-summary');
        e.stopPropagation();
      }}
      onKeyDown={(e) => {
        if (!onSelectNode) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectNode('checkout:order-summary');
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

      {isMobile ? (
        <div className="relative z-10 mb-3 flex items-center justify-between gap-3 border-b border-[#e1e3e5] pb-3">
          <span className="text-[14px] font-medium text-[#121212]">Order summary</span>
          <div className="flex min-w-0 items-baseline gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-[#8a8a8a]">
              {checkoutPreviewCurrencyCode()}
            </span>
            <span className="truncate text-[16px] font-semibold tabular-nums text-[#121212]">
              {lineItem.totalFormatted}
            </span>
          </div>
        </div>
      ) : null}

      <div className={`relative z-10 flex gap-4 ${isMobile ? 'gap-3' : ''}`}>
        <div
          className={`relative shrink-0 overflow-hidden rounded-lg border border-[#e1e3e5] bg-white ${
            isMobile ? 'h-14 w-14' : 'h-16 w-16'
          }`}
        >
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
          <p
            className={`font-medium leading-snug text-[#121212] ${
              isMobile ? 'line-clamp-2 text-[13px]' : 'text-[14px]'
            } ${loading ? 'text-[#707070]' : ''}`}
          >
            {lineItem.title}
          </p>
        </div>

        <div
          className={`shrink-0 tabular-nums text-[#121212] ${
            isMobile ? 'pt-0 text-[13px]' : 'pt-0.5 text-[14px]'
          }`}
        >
          {lineItem.unitPriceFormatted}
        </div>
      </div>

      <div className={`relative z-10 space-y-3 ${isMobile ? 'mt-4' : 'mt-8'}`}>
        <SummaryRow label="Subtotal" value={lineItem.subtotalFormatted} compact={isMobile} />
        <SummaryRow label="Shipping" value={lineItem.shippingFormatted} showInfo compact={isMobile} />
      </div>

      <div
        className={`relative z-10 flex items-end justify-between gap-4 border-t border-[#e1e3e5] ${
          isMobile ? 'mt-4 pt-4' : 'mt-8 pt-5'
        }`}
      >
        <span className={`font-semibold text-[#121212] ${isMobile ? 'text-[16px]' : 'text-[18px]'}`}>
          Total
        </span>
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="text-[12px] font-medium uppercase tracking-wide text-[#8a8a8a]">
            {checkoutPreviewCurrencyCode()}
          </span>
          <span
            className={`font-semibold leading-none tabular-nums text-[#121212] ${
              isMobile ? 'text-[18px]' : 'text-[22px]'
            }`}
          >
            {lineItem.totalFormatted}
          </span>
        </div>
      </div>
    </aside>
  );
}
