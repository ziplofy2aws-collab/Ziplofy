import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import type { CheckoutOrderSummaryConfig } from './settings/checkout-settings.types';
import { resolveCheckoutOrderSummaryColors } from './settings/checkout-settings.types';
import { checkoutPreviewCurrencyCode, formatCheckoutPrice } from './utils/format-checkout-price';

export type CheckoutOrderSummaryLine = {
  id: string;
  title: string;
  imageUrl?: string | null;
  quantity: number;
  lineTotal: number;
};

export type CheckoutOrderSummaryTotals = {
  subtotal: number;
  shipping: number;
  tax?: number;
  taxLabel?: string;
  total: number;
};

type Props = {
  lines: CheckoutOrderSummaryLine[];
  totals: CheckoutOrderSummaryTotals;
  orderSummaryConfig?: CheckoutOrderSummaryConfig;
  colorPalette?: string[];
  layout?: 'desktop' | 'mobile';
  loading?: boolean;
  emptyMessage?: string;
  highlightNodeId?: string | null;
  accentColorOverride?: string;
  onSelectNode?: (nodeId: string) => void;
  selectable?: boolean;
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

export function CheckoutOrderSummaryContent({
  lines,
  totals,
  orderSummaryConfig,
  colorPalette,
  layout = 'desktop',
  loading = false,
  emptyMessage = 'Your cart is empty.',
  highlightNodeId = null,
  accentColorOverride,
  onSelectNode,
  selectable = false,
}: Props) {
  const isMobile = layout === 'mobile';
  const { backgroundColor, accentColor: paletteAccent } = resolveCheckoutOrderSummaryColors(
    orderSummaryConfig,
    colorPalette
  );
  const accentColor = accentColorOverride ?? paletteAccent;
  const backgroundImage = orderSummaryConfig?.backgroundImage?.trim() || null;
  const sectionHighlighted = highlightNodeId === 'checkout:order-summary';
  const hasLines = lines.length > 0;

  return (
    <aside
      className={`relative flex min-h-full w-full flex-1 flex-col pointer-events-auto ${
        isMobile ? 'shrink-0 p-4' : 'p-6 sm:p-8'
      } ${selectable && onSelectNode ? 'cursor-pointer' : ''}`}
      style={{
        backgroundColor,
        ...(sectionHighlighted ? { boxShadow: `inset 0 0 0 2px ${accentColor}` } : {}),
      }}
      data-checkout-node-id={selectable ? 'checkout:order-summary' : undefined}
      data-checkout-selectable={selectable && onSelectNode ? 'true' : undefined}
      onClick={
        selectable && onSelectNode
          ? (e) => {
              onSelectNode('checkout:order-summary');
              e.stopPropagation();
            }
          : undefined
      }
      onKeyDown={
        selectable && onSelectNode
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectNode('checkout:order-summary');
              }
            }
          : undefined
      }
      role={selectable && onSelectNode ? 'button' : undefined}
      tabIndex={selectable && onSelectNode ? 0 : undefined}
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
              {formatCheckoutPrice(totals.total)}
            </span>
          </div>
        </div>
      ) : null}

      <div className="relative z-10 space-y-4">
        {loading && !hasLines ? (
          <p className="text-[14px] text-[#707070]">Loading…</p>
        ) : null}

        {!loading && !hasLines ? (
          <p className="text-[14px] text-[#707070]">{emptyMessage}</p>
        ) : null}

        {lines.map((item) => (
          <div key={item.id} className={`relative z-10 flex gap-4 ${isMobile ? 'gap-3' : ''}`}>
            <div
              className={`relative shrink-0 overflow-hidden rounded-lg border border-[#e1e3e5] bg-white ${
                isMobile ? 'h-14 w-14' : 'h-16 w-16'
              }`}
            >
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
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
                {item.title}
              </p>
            </div>

            <div
              className={`shrink-0 tabular-nums text-[#121212] ${
                isMobile ? 'pt-0 text-[13px]' : 'pt-0.5 text-[14px]'
              }`}
            >
              {formatCheckoutPrice(item.lineTotal)}
            </div>
          </div>
        ))}
      </div>

      {hasLines ? (
        <>
          <div className={`relative z-10 space-y-3 ${isMobile ? 'mt-4' : 'mt-8'}`}>
            <SummaryRow label="Subtotal" value={formatCheckoutPrice(totals.subtotal)} compact={isMobile} />
            <SummaryRow
              label="Shipping"
              value={formatCheckoutPrice(totals.shipping)}
              showInfo
              compact={isMobile}
            />
            {(totals.tax ?? 0) > 0 ? (
              <SummaryRow
                label={totals.taxLabel || 'Tax'}
                value={formatCheckoutPrice(totals.tax || 0)}
                compact={isMobile}
              />
            ) : null}
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
                {formatCheckoutPrice(totals.total)}
              </span>
            </div>
          </div>
        </>
      ) : null}
    </aside>
  );
}
