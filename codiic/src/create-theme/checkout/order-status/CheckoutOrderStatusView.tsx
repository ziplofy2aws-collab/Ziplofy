import type { CheckoutFooterConfig, CheckoutHeaderPosition, CheckoutPaletteTheme } from '../settings/checkout-settings.types';
import { CHECKOUT_ACCOUNT_MAX_WIDTH_CLASS } from '../settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import { CheckoutFooterRuntimePreview } from '../preview/CheckoutFooterRuntimePreview';
import { CheckoutHeaderRuntimePreview, type CheckoutLogoPreviewConfig } from '../preview/CheckoutHeaderRuntimePreview';
import { CheckoutTypographyFontLoader } from '../preview/CheckoutTypographyFontLoader';
import { CHECKOUT_STOREFRONT_ROOT_CLASS } from '../checkout-storefront.constants';
import { CheckoutOrderStatusContent } from './CheckoutOrderStatusContent';
import type { CheckoutOrderStatusDetails } from './checkout-order-status.types';
import { CHECKOUT_ORDER_STATUS_PREVIEW } from './checkout-order-status.types';

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
  backHref?: string;
};

type PreviewProps = BaseProps & {
  mode: 'preview';
};

type LiveProps = BaseProps & {
  mode: 'live';
  details: CheckoutOrderStatusDetails;
};

export type CheckoutOrderStatusViewProps = PreviewProps | LiveProps;

export function CheckoutOrderStatusView(props: CheckoutOrderStatusViewProps) {
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
    backHref = '/my-orders',
  } = props;

  const isMobile = device === 'mobile';
  const isPreview = props.mode === 'preview';
  const isFullWidthHeader = headerPosition === 'full_width';
  const isFullWidthFooter = (footerConfig?.location ?? 'checkout_form') === 'full_width';
  const bodyFontFamily = typography?.bodyFontFamily;
  const details = isPreview ? CHECKOUT_ORDER_STATUS_PREVIEW : props.details;

  const outerClass =
    variant === 'storefront'
      ? `${CHECKOUT_STOREFRONT_ROOT_CLASS} checkout-storefront-account pointer-events-auto flex min-h-screen flex-col bg-white`
      : 'flex h-full min-h-0 flex-col overflow-hidden bg-white';

  const scrollClass =
    variant === 'storefront'
      ? 'checkout-account-scroll pointer-events-auto w-full'
      : 'checkout-preview-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain';

  const headerSlot = (
    <div
      className="shrink-0 border-b border-[#e1e3e5]"
      style={{ backgroundColor: theme?.headerBackgroundColor ?? '#ffffff' }}
    >
      <div className={isMobile ? 'w-full' : `mx-auto w-full ${CHECKOUT_ACCOUNT_MAX_WIDTH_CLASS}`}>
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
    <div className={outerClass}>
      <CheckoutTypographyFontLoader
        fonts={[typography?.headingGoogleFont, typography?.bodyGoogleFont]}
      />
      {isFullWidthHeader ? headerSlot : null}

      <div className={scrollClass}>
        <div
          className={`mx-auto w-full ${isMobile ? 'max-w-none' : CHECKOUT_ACCOUNT_MAX_WIDTH_CLASS}`}
          style={bodyFontFamily ? { fontFamily: bodyFontFamily } : undefined}
        >
          {!isFullWidthHeader ? headerSlot : null}

          <CheckoutOrderStatusContent
            storeId={storeId}
            details={details}
            device={device}
            theme={theme}
            typography={typography}
            footerConfig={footerConfig}
            backHref={backHref}
            highlightNodeId={highlightNodeId}
            onSelectNode={onSelectNode}
          />
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
