import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { CheckoutOrderCardData } from './checkout-order-card.types';
import { checkoutPreviewCurrencyCode, formatCheckoutPrice } from '../utils/format-checkout-price';

type Props = {
  order: CheckoutOrderCardData;
  buttonColor: string;
  isMobile: boolean;
  detailHref?: string;
};

function OrderThumbnail({ order }: { order: CheckoutOrderCardData }) {
  return (
    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-[#e1e3e5] bg-white">
      {order.imageUrl ? (
        <img src={order.imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className={`h-full w-full bg-linear-to-br ${order.imageGradient}`} aria-hidden />
      )}
    </div>
  );
}

export function CheckoutOrderCard({ order, buttonColor, isMobile, detailHref }: Props) {
  const showPayNow = order.showPayNow ?? true;
  const showDueWarning = order.showDueWarning ?? Boolean(order.dueDate);
  const currency = checkoutPreviewCurrencyCode();

  const statusBlock = (
    <>
      <p className="text-[14px] font-semibold text-[#121212]">{order.status}</p>
      <OrderMeta order={order} currency={currency} showDueWarning={showDueWarning} compact={isMobile} />
    </>
  );

  return (
    <article className="rounded-lg border border-[#dedede] bg-white p-4 sm:p-5">
      <div className={`flex gap-4 ${isMobile ? 'flex-col' : ''}`}>
        <div className={isMobile ? 'flex gap-4' : ''}>
          {detailHref ? (
            <Link to={detailHref} className="shrink-0 text-inherit no-underline">
              <OrderThumbnail order={order} />
            </Link>
          ) : (
            <OrderThumbnail order={order} />
          )}
          {isMobile ? (
            <div className="min-w-0 flex-1">
              {detailHref ? (
                <Link to={detailHref} className="block text-inherit no-underline hover:underline">
                  {statusBlock}
                </Link>
              ) : (
                statusBlock
              )}
            </div>
          ) : null}
        </div>

        {!isMobile ? (
          <div className="flex min-w-0 flex-1 flex-col">
            {detailHref ? (
              <Link to={detailHref} className="text-inherit no-underline hover:underline">
                {statusBlock}
              </Link>
            ) : (
              statusBlock
            )}
            <OrderActions
              showPayNow={showPayNow}
              buttonColor={buttonColor}
              isMobile={false}
              className="mt-4"
            />
          </div>
        ) : (
          <OrderActions showPayNow={showPayNow} buttonColor={buttonColor} isMobile className="mt-1" />
        )}
      </div>
    </article>
  );
}

function OrderMeta({
  order,
  currency,
  showDueWarning,
  compact = false,
}: {
  order: CheckoutOrderCardData;
  currency: string;
  showDueWarning: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-2 text-[#707070] ${
        compact ? 'mt-1 text-[12px]' : 'mt-1 text-[13px]'
      }`}
    >
      <span>#{order.id}</span>
      <span aria-hidden>·</span>
      <span>
        {formatCheckoutPrice(order.amount)} {currency}
      </span>
      {showDueWarning && order.dueDate ? (
        <>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1 text-[#8a6116]">
            <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Due {order.dueDate}
          </span>
        </>
      ) : null}
    </div>
  );
}

function OrderActions({
  showPayNow,
  buttonColor,
  isMobile,
  className = '',
}: {
  showPayNow: boolean;
  buttonColor: string;
  isMobile: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap gap-2 ${isMobile ? 'w-full' : 'justify-end'} ${className}`}
    >
      {showPayNow ? (
        <button
          type="button"
          className={`rounded-md px-4 py-2 text-[13px] font-medium text-white ${
            isMobile ? 'min-h-[40px] flex-1' : 'min-w-[100px]'
          }`}
          style={{ backgroundColor: buttonColor }}
        >
          Pay now
        </button>
      ) : null}
      <button
        type="button"
        className={`rounded-md border bg-white px-4 py-2 text-[13px] font-medium ${
          isMobile ? 'min-h-[40px] flex-1' : 'min-w-[100px]'
        }`}
        style={{ borderColor: buttonColor, color: buttonColor }}
      >
        Buy again
      </button>
    </div>
  );
}
