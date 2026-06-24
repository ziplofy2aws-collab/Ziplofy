import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { CheckoutFooterConfig, CheckoutHeaderPosition, CheckoutPaletteTheme } from '../settings/checkout-settings.types';
import { CHECKOUT_FORM_MAX_WIDTH_CLASS } from '../settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import { formatCheckoutPrice } from '../utils/format-checkout-price';
import { CheckoutFooterRuntimePreview } from '../preview/CheckoutFooterRuntimePreview';
import { CheckoutHeaderRuntimePreview, type CheckoutLogoPreviewConfig } from '../preview/CheckoutHeaderRuntimePreview';
import { CheckoutTypographyFontLoader } from '../preview/CheckoutTypographyFontLoader';
import type { CheckoutOrderCardData } from './checkout-order-card.types';
import { CHECKOUT_EXAMPLE_ORDERS } from './checkout-order-card.types';
import { CHECKOUT_STOREFRONT_ROOT_CLASS } from '../checkout-storefront.constants';

type PreviewDevice = 'desktop' | 'mobile';

type BaseProps = {
  device?: PreviewDevice;
  storeId?: string | null;
  storeName?: string;
  storeUrl?: string | null;
  headerPosition?: CheckoutHeaderPosition;
  footerConfig?: CheckoutFooterConfig;
  logo?: CheckoutLogoPreviewConfig;
  theme?: CheckoutPaletteTheme;
  typography?: CheckoutTypographyTheme;
  variant?: 'preview' | 'storefront';
  highlightNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
};

type PreviewProps = BaseProps & {
  mode: 'preview';
};

type LiveProps = BaseProps & {
  mode: 'live';
  orders: CheckoutOrderCardData[];
  loading?: boolean;
  profileHref?: string;
};

export type CheckoutOrdersViewProps = PreviewProps | LiveProps;

function OrderCard({
  order,
  buttonColor,
  isMobile,
}: {
  order: CheckoutOrderCardData;
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
          <p className="mt-1 text-[13px] text-[#121212]">{formatCheckoutPrice(order.amount)} INR</p>
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

function ProfileBreadcrumb({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-[14px] text-[#b5b5b5]">{children}</p>;
}

export function CheckoutOrdersView(props: CheckoutOrdersViewProps) {
  const {
    device = 'desktop',
    storeId,
    storeName = 'My Store',
    storeUrl,
    headerPosition = 'checkout_form',
    footerConfig,
    logo,
    theme,
    typography,
    variant = props.mode === 'live' ? 'storefront' : 'preview',
    highlightNodeId,
    onSelectNode,
  } = props;

  const isMobile = device === 'mobile';
  const isPreview = props.mode === 'preview';
  const isFullWidthHeader = headerPosition === 'full_width';
  const isFullWidthFooter = (footerConfig?.location ?? 'checkout_form') === 'full_width';
  const headingsFontFamily = typography?.headingsFontFamily;
  const bodyFontFamily = typography?.bodyFontFamily;
  const buttonColor = theme?.buttonColor ?? '#005bd3';
  const mainHighlighted = highlightNodeId === 'checkout:orders:group:main';
  const orders = isPreview ? CHECKOUT_EXAMPLE_ORDERS : props.orders;
  const loading = !isPreview && props.loading;
  const profileHref = !isPreview ? (props.profileHref ?? '/profile') : undefined;

  const outerClass =
    variant === 'storefront'
      ? `${CHECKOUT_STOREFRONT_ROOT_CLASS} flex min-h-screen flex-col overflow-hidden bg-white`
      : 'flex h-full min-h-0 flex-col overflow-hidden bg-white';

  const scrollClass =
    variant === 'storefront'
      ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain'
      : 'checkout-preview-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain';

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

  const footerInMain =
    (footerConfig?.location ?? 'checkout_form') !== 'full_width' ? (
      <CheckoutFooterRuntimePreview
        storeId={storeId}
        alignment={footerConfig?.alignment ?? 'left'}
        accentColor={theme?.accentColor}
        device={device}
        highlightNodeId={highlightNodeId}
        onSelectNode={onSelectNode}
        constrained
      />
    ) : null;

  const mainInner = (
    <>
      <h1
        className="text-[28px] font-semibold leading-tight text-[#121212]"
        style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
      >
        Orders
      </h1>
      {profileHref ? (
        <ProfileBreadcrumb>
          <Link to={profileHref} className="hover:underline">
            Profile
          </Link>
        </ProfileBreadcrumb>
      ) : (
        <ProfileBreadcrumb>Profile</ProfileBreadcrumb>
      )}

      {loading ? (
        <p className="mt-6 text-[14px] text-[#707070]">Loading your orders…</p>
      ) : orders.length === 0 ? (
        <p className="mt-6 text-[14px] text-[#707070]">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} buttonColor={buttonColor} isMobile={isMobile} />
          ))}
        </div>
      )}

      {footerInMain}
    </>
  );

  return (
    <div className={outerClass}>
      <CheckoutTypographyFontLoader
        fonts={[typography?.headingGoogleFont, typography?.bodyGoogleFont]}
      />
      {isFullWidthHeader ? headerSlot : null}

      <div className={scrollClass}>
        <div
          className={`mx-auto w-full ${isMobile ? 'max-w-none' : CHECKOUT_FORM_MAX_WIDTH_CLASS}`}
          style={bodyFontFamily ? { fontFamily: bodyFontFamily } : undefined}
        >
          {!isFullWidthHeader ? headerSlot : null}

          {onSelectNode ? (
            <div
              className={`w-full select-none ${isMobile ? 'px-4 py-6' : 'px-6 py-8 sm:px-8'} cursor-pointer ${
                mainHighlighted ? 'ring-2 ring-inset ring-[#005bd3]' : ''
              }`}
              style={{ backgroundColor: theme?.mainBackgroundColor ?? '#ffffff' }}
              data-checkout-node-id="checkout:orders:group:main"
              data-checkout-selectable="true"
              onClick={(e) => {
                onSelectNode('checkout:orders:group:main');
                e.stopPropagation();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectNode('checkout:orders:group:main');
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className={mainHighlighted ? 'pointer-events-none' : ''}>{mainInner}</div>
            </div>
          ) : (
            <div
              className={`w-full ${isMobile ? 'px-4 py-6' : 'px-6 py-8 sm:px-8'}`}
              style={{ backgroundColor: theme?.mainBackgroundColor ?? '#ffffff' }}
            >
              {mainInner}
            </div>
          )}
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
