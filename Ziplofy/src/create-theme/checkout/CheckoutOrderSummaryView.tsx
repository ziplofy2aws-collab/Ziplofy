import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  formatINR,
  useStorefrontAuth,
  useStorefrontCart,
  type GuestCartItem,
  type StorefrontCartItem,
} from '@render-store/sdk';
import type { CheckoutOrderSummaryConfig } from './settings/checkout-settings.types';
import { resolveCheckoutOrderSummaryColors } from './settings/checkout-settings.types';
import { checkoutPreviewCurrencyCode } from './utils/format-checkout-price';
import { CHECKOUT_DEFAULT_SHIPPING_AMOUNT } from './utils/checkout-order.utils';

type Props = {
  storeId?: string | null;
  orderSummaryConfig?: CheckoutOrderSummaryConfig;
  colorPalette?: string[];
  layout?: 'desktop' | 'mobile';
};

function variantOf(item: StorefrontCartItem | GuestCartItem) {
  const v = item.productVariantId;
  return typeof v === 'object' && v !== null && '_id' in v ? v : null;
}

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

export function CheckoutOrderSummaryView({
  orderSummaryConfig,
  colorPalette,
  layout = 'desktop',
}: Props) {
  const isMobile = layout === 'mobile';
  const { user, checkAuth } = useStorefrontAuth();
  const { getAllItems, getCartByCustomerId, loading } = useStorefrontCart();

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user?._id) return;
    void getCartByCustomerId(user._id);
  }, [getCartByCustomerId, user?._id]);

  const lines = getAllItems();

  const { backgroundColor, accentColor } = resolveCheckoutOrderSummaryColors(
    orderSummaryConfig,
    colorPalette
  );
  const backgroundImage = orderSummaryConfig?.backgroundImage?.trim() || null;

  const totals = useMemo(() => {
    let subtotal = 0;
    for (const item of lines) {
      const variant = variantOf(item);
      if (variant) subtotal += variant.price * item.quantity;
    }
    const shipping = lines.length > 0 ? CHECKOUT_DEFAULT_SHIPPING_AMOUNT : 0;
    return { subtotal, shipping, total: subtotal + shipping };
  }, [lines]);

  return (
    <aside
      className={`relative flex min-h-full w-full flex-1 flex-col ${isMobile ? 'w-full shrink-0 p-4' : 'p-6 sm:p-8'}`}
      style={{ backgroundColor }}
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
              {formatINR(totals.total)}
            </span>
          </div>
        </div>
      ) : null}

      <div className="relative z-10 space-y-4">
        {loading && lines.length === 0 ? (
          <p className="text-[14px] text-[#707070]">Loading cart…</p>
        ) : null}

        {!loading && lines.length === 0 ? (
          <div className="space-y-3">
            <p className="text-[14px] text-[#707070]">Your cart is empty.</p>
            <Link to="/cart" className="text-[14px] font-medium hover:underline" style={{ color: accentColor }}>
              Return to cart
            </Link>
          </div>
        ) : null}

        {lines.map((item) => {
          const variant = variantOf(item);
          const title = variant?.sku || 'Product';
          const imageUrl = variant?.images?.[0] ?? null;
          const lineTotal = variant ? variant.price * item.quantity : 0;

          return (
            <div key={item._id} className={`relative z-10 flex gap-4 ${isMobile ? 'gap-3' : ''}`}>
              <div
                className={`relative shrink-0 overflow-hidden rounded-lg border border-[#e1e3e5] bg-white ${
                  isMobile ? 'h-14 w-14' : 'h-16 w-16'
                }`}
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ProductImagePlaceholder />
                )}
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#121212] px-1 text-[11px] font-medium text-white">
                  {item.quantity}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`font-medium leading-snug text-[#121212] ${
                    isMobile ? 'line-clamp-2 text-[13px]' : 'text-[14px]'
                  }`}
                >
                  {title}
                </p>
              </div>

              <div
                className={`shrink-0 tabular-nums text-[#121212] ${
                  isMobile ? 'pt-0 text-[13px]' : 'pt-0.5 text-[14px]'
                }`}
              >
                {formatINR(lineTotal)}
              </div>
            </div>
          );
        })}
      </div>

      {lines.length > 0 ? (
        <>
          <div className={`relative z-10 space-y-3 ${isMobile ? 'mt-4' : 'mt-8'}`}>
            <SummaryRow label="Subtotal" value={formatINR(totals.subtotal)} compact={isMobile} />
            <SummaryRow
              label="Shipping"
              value={formatINR(totals.shipping)}
              showInfo
              compact={isMobile}
            />
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
                {formatINR(totals.total)}
              </span>
            </div>
          </div>
        </>
      ) : null}
    </aside>
  );
}
