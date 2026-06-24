import React from 'react';
import type { CheckoutFooterConfig, CheckoutHeaderPosition, CheckoutPaletteTheme } from '../settings/checkout-settings.types';
import { CHECKOUT_FORM_MAX_WIDTH_CLASS } from '../settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import { formatCheckoutPrice } from '../utils/format-checkout-price';
import { CheckoutFooterRuntimePreview } from './CheckoutFooterRuntimePreview';
import { CheckoutHeaderRuntimePreview, type CheckoutLogoPreviewConfig } from './CheckoutHeaderRuntimePreview';
import { CheckoutTypographyFontLoader } from './CheckoutTypographyFontLoader';

type PreviewDevice = 'desktop' | 'mobile';

type OrderPreview = {
  id: string;
  status: string;
  amount: number;
  dueDate: string;
  imageGradient: string;
};

const EXAMPLE_ORDERS: OrderPreview[] = [
  {
    id: '1001',
    status: 'On its way',
    amount: 999,
    dueDate: '22 Jul',
    imageGradient: 'from-[#f3e8ff] via-[#fce7f3] to-[#fef3c7]',
  },
  {
    id: '1002',
    status: 'Confirmed',
    amount: 799,
    dueDate: '12 Jul',
    imageGradient: 'from-[#fde68a] via-[#fcd34d] to-[#d97706]',
  },
];

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

function OrderCard({
  order,
  buttonColor,
  isMobile,
}: {
  order: OrderPreview;
  buttonColor: string;
  isMobile: boolean;
}) {
  return (
    <article className="rounded-md border border-[#dedede] bg-white p-4">
      <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'items-start'}`}>
        <div
          className={`h-16 w-16 shrink-0 rounded-md bg-linear-to-br ${order.imageGradient}`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium text-[#121212]">Order #{order.id}</p>
          <p className="mt-1 text-[13px] text-[#707070]">{order.status}</p>
          <p className="mt-1 text-[13px] text-[#121212]">
            {formatCheckoutPrice(order.amount)} INR
          </p>
          <p className="mt-0.5 text-[13px] text-[#707070]">Due {order.dueDate}</p>
        </div>
        <div className={`flex shrink-0 gap-2 ${isMobile ? 'w-full' : 'flex-col'}`}>
          <button
            type="button"
            className={`rounded-md px-4 py-2 text-[13px] font-medium text-white ${
              isMobile ? 'flex-1' : 'min-w-[96px]'
            }`}
            style={{ backgroundColor: buttonColor }}
          >
            Pay now
          </button>
          <button
            type="button"
            className={`rounded-md border border-[#dedede] bg-white px-4 py-2 text-[13px] font-medium text-[#121212] ${
              isMobile ? 'flex-1' : 'min-w-[96px]'
            }`}
          >
            Buy again
          </button>
        </div>
      </div>
    </article>
  );
}

export function CheckoutOrdersRuntimePreview({
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
  const mainHighlighted = highlightNodeId === 'checkout:orders:group:main';

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
            data-checkout-node-id="checkout:orders:group:main"
            data-checkout-selectable={onSelectNode ? 'true' : undefined}
            onClick={(e) => {
              onSelectNode?.('checkout:orders:group:main');
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              if (!onSelectNode) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectNode('checkout:orders:group:main');
              }
            }}
            role={onSelectNode ? 'button' : undefined}
            tabIndex={onSelectNode ? 0 : undefined}
          >
            <div className={mainHighlighted ? 'pointer-events-none' : ''}>
              <h1
                className="text-[28px] font-semibold leading-tight text-[#121212]"
                style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
              >
                Orders
              </h1>
              <p className="mt-3 text-[14px] text-[#b5b5b5]">Profile</p>

              <div className="mt-6 space-y-4">
                {EXAMPLE_ORDERS.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    buttonColor={buttonColor}
                    isMobile={isMobile}
                  />
                ))}
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
