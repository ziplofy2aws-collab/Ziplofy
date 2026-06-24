import { type Ref } from 'react';
import type { CheckoutMainViewHandle } from './CheckoutMainView';
import type {
  CheckoutFooterConfig,
  CheckoutHeaderPosition,
  CheckoutOrderSummaryConfig,
  CheckoutPaletteTheme,
} from './settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from './settings/checkout-typography-fonts';
import { CHECKOUT_FORM_MAX_WIDTH_CLASS } from './settings/checkout-settings.types';
import { CheckoutMainView } from './CheckoutMainView';
import { CheckoutOrderSummaryView } from './CheckoutOrderSummaryView';
import { CheckoutFooterRuntimePreview } from './preview/CheckoutFooterRuntimePreview';
import { CheckoutHeaderRuntimePreview, type CheckoutLogoPreviewConfig } from './preview/CheckoutHeaderRuntimePreview';
import { CheckoutMainRuntimePreview } from './preview/CheckoutMainRuntimePreview';
import { CheckoutOrderSummaryRuntimePreview } from './preview/CheckoutOrderSummaryRuntimePreview';
import { CheckoutTypographyFontLoader } from './preview/CheckoutTypographyFontLoader';

type PreviewDevice = 'desktop' | 'mobile';

type BaseProps = {
  device?: PreviewDevice;
  storeId?: string | null;
  storeName?: string;
  storeUrl?: string | null;
  headerPosition?: CheckoutHeaderPosition;
  footerConfig?: CheckoutFooterConfig;
  orderSummaryConfig?: CheckoutOrderSummaryConfig;
  logo?: CheckoutLogoPreviewConfig;
  theme?: CheckoutPaletteTheme;
  typography?: CheckoutTypographyTheme;
  inputFieldsTransparent?: boolean;
  addressAutocompletion?: boolean;
};

type PreviewProps = BaseProps & {
  mode: 'preview';
  highlightNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
};

type LiveProps = BaseProps & {
  mode: 'live';
  mainFormRef?: Ref<CheckoutMainViewHandle>;
  onCompleteOrder?: () => void;
  submitting?: boolean;
};

export type CheckoutCheckoutViewProps = PreviewProps | LiveProps;

function HeaderSlot({
  storeName,
  storeUrl,
  logo,
  theme,
  device,
  highlightNodeId,
  onSelectNode,
  constrained = false,
}: {
  storeName?: string;
  storeUrl?: string | null;
  logo?: CheckoutLogoPreviewConfig;
  theme?: CheckoutPaletteTheme;
  device: PreviewDevice;
  highlightNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  constrained?: boolean;
}) {
  return (
    <div
      className="shrink-0 border-b border-[#e1e3e5]"
      style={{ backgroundColor: theme?.headerBackgroundColor ?? '#ffffff' }}
    >
      <div className={constrained ? `mx-auto w-full ${CHECKOUT_FORM_MAX_WIDTH_CLASS}` : 'w-full'}>
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
}

function FooterSlot({
  storeId,
  footerConfig,
  device,
  highlightNodeId,
  onSelectNode,
  constrained = false,
  accentColor,
}: {
  storeId?: string | null;
  footerConfig?: CheckoutFooterConfig;
  device: PreviewDevice;
  highlightNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  constrained?: boolean;
  accentColor?: string;
}) {
  return (
    <div className={constrained ? '' : 'border-t border-[#e1e3e5] bg-white'}>
      <div className={constrained ? '' : 'w-full'}>
        <CheckoutFooterRuntimePreview
          storeId={storeId}
          alignment={footerConfig?.alignment ?? 'left'}
          device={device}
          highlightNodeId={highlightNodeId}
          onSelectNode={onSelectNode}
          constrained={constrained}
          accentColor={accentColor}
        />
      </div>
    </div>
  );
}

export function CheckoutCheckoutView(props: CheckoutCheckoutViewProps) {
  const {
    device = 'desktop',
    storeId,
    storeName,
    storeUrl,
    headerPosition = 'checkout_form',
    footerConfig,
    orderSummaryConfig,
    logo,
    theme,
    typography,
    inputFieldsTransparent = false,
    addressAutocompletion = false,
    mode,
  } = props;

  const isMobile = device === 'mobile';
  const isFullWidthHeader = headerPosition === 'full_width';
  const isFullWidthFooter = (footerConfig?.location ?? 'checkout_form') === 'full_width';
  const isPreview = mode === 'preview';
  const isLive = mode === 'live';
  const highlightNodeId = isPreview ? props.highlightNodeId : null;
  const onSelectNode = isPreview ? props.onSelectNode : undefined;

  const mainForm =
    mode === 'live' ? (
      <CheckoutMainView
        ref={props.mainFormRef}
        accentColor={theme?.accentColor}
        buttonColor={theme?.buttonColor}
        addressAutocompletion={addressAutocompletion}
        inputFieldsTransparent={inputFieldsTransparent}
        typography={typography}
        device={device}
        onCompleteOrder={props.onCompleteOrder}
        submitting={props.submitting}
      />
    ) : (
      <CheckoutMainRuntimePreview
        accentColor={theme?.accentColor}
        buttonColor={theme?.buttonColor}
        addressAutocompletion={addressAutocompletion}
        inputFieldsTransparent={inputFieldsTransparent}
        typography={typography}
        device={device}
      />
    );

  const orderSummary =
    mode === 'live' ? (
      <CheckoutOrderSummaryView
        storeId={storeId}
        orderSummaryConfig={orderSummaryConfig}
        colorPalette={theme?.colorPalette}
        layout={device}
      />
    ) : (
      <CheckoutOrderSummaryRuntimePreview
        storeId={storeId}
        orderSummaryConfig={orderSummaryConfig}
        colorPalette={theme?.colorPalette}
        highlightNodeId={highlightNodeId}
        layout={device}
        onSelectNode={onSelectNode}
      />
    );

  const orderSummarySlot = (
    <div
      className={
        isMobile
          ? 'w-full shrink-0 border-b border-[#e1e3e5] bg-[#fafafa]'
          : `w-[42%] max-w-[480px] shrink-0 self-start border-l border-[#e1e3e5] bg-[#fafafa] ${
              isLive ? 'sticky top-0' : 'sticky top-0 max-h-full overflow-y-auto overscroll-contain'
            }`
      }
    >
      {orderSummary}
    </div>
  );

  const mainColumn = (
    <div className="min-w-0 flex-1">
      {!isFullWidthHeader ? (
        <HeaderSlot
          storeName={storeName}
          storeUrl={storeUrl}
          logo={logo}
          theme={theme}
          device={device}
          highlightNodeId={highlightNodeId}
          onSelectNode={onSelectNode}
          constrained={!isMobile}
        />
      ) : null}
      <div style={{ backgroundColor: theme?.mainBackgroundColor ?? '#ffffff' }}>
        {mainForm}
        {!isFullWidthFooter ? (
          <FooterSlot
            storeId={storeId}
            footerConfig={footerConfig}
            device={device}
            highlightNodeId={highlightNodeId}
            onSelectNode={onSelectNode}
            constrained={!isMobile}
            accentColor={theme?.accentColor}
          />
        ) : null}
      </div>
    </div>
  );

  const contentRow = (
    <div
      className={`mx-auto flex w-full ${isMobile ? 'max-w-none flex-col' : 'flex-row items-start'}`}
    >
      {isMobile ? orderSummarySlot : null}
      {mainColumn}
      {!isMobile ? orderSummarySlot : null}
    </div>
  );

  if (isLive) {
    return (
      <div className="min-h-screen bg-white">
        <CheckoutTypographyFontLoader
          fonts={[typography?.headingGoogleFont, typography?.bodyGoogleFont]}
        />
        {isFullWidthHeader ? (
          <HeaderSlot
            storeName={storeName}
            storeUrl={storeUrl}
            logo={logo}
            theme={theme}
            device={device}
          />
        ) : null}
        {contentRow}
        {isFullWidthFooter ? (
          <FooterSlot
            storeId={storeId}
            footerConfig={footerConfig}
            device={device}
            accentColor={theme?.accentColor}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <CheckoutTypographyFontLoader
        fonts={[typography?.headingGoogleFont, typography?.bodyGoogleFont]}
      />
      {isFullWidthHeader ? (
        <HeaderSlot
          storeName={storeName}
          storeUrl={storeUrl}
          logo={logo}
          theme={theme}
          device={device}
          highlightNodeId={highlightNodeId}
          onSelectNode={onSelectNode}
        />
      ) : null}

      <div className="checkout-preview-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {contentRow}
      </div>

      {isFullWidthFooter ? (
        <FooterSlot
          storeId={storeId}
          footerConfig={footerConfig}
          device={device}
          highlightNodeId={highlightNodeId}
          onSelectNode={onSelectNode}
          accentColor={theme?.accentColor}
        />
      ) : null}
    </div>
  );
}
