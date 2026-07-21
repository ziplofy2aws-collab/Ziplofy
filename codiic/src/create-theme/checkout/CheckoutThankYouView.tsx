import type {
  CheckoutFooterConfig,
  CheckoutHeaderPosition,
  CheckoutOrderSummaryConfig,
  CheckoutPaletteTheme,
  CheckoutThankYouMainConfig,
} from './settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from './settings/checkout-typography-fonts';
import { CheckoutOrderSummaryContent, type CheckoutOrderSummaryLine } from './CheckoutOrderSummaryContent';
import {
  CheckoutThankYouMainContent,
  type CheckoutThankYouDetails,
} from './CheckoutThankYouMainContent';
import { CheckoutThankYouShell } from './CheckoutThankYouShell';
import type { CheckoutLogoPreviewConfig } from './preview/CheckoutHeaderRuntimePreview';

export type CheckoutThankYouOrderSummary = CheckoutThankYouDetails & {
  lines: CheckoutOrderSummaryLine[];
  subtotal: number;
  shipping: number;
  total: number;
};

type Props = {
  device?: 'desktop' | 'mobile';
  storeId?: string | null;
  storeName?: string;
  storeUrl?: string | null;
  headerPosition?: CheckoutHeaderPosition;
  mainConfig?: CheckoutThankYouMainConfig;
  footerConfig?: CheckoutFooterConfig;
  orderSummaryConfig?: CheckoutOrderSummaryConfig;
  logo?: CheckoutLogoPreviewConfig;
  theme?: CheckoutPaletteTheme;
  typography?: CheckoutTypographyTheme;
  order: CheckoutThankYouOrderSummary;
};

export function CheckoutThankYouView({
  device = 'desktop',
  storeId,
  storeName,
  storeUrl,
  headerPosition = 'checkout_form',
  mainConfig,
  footerConfig,
  orderSummaryConfig,
  logo,
  theme,
  typography,
  order,
}: Props) {
  const { lines, subtotal, shipping, total, ...details } = order;

  return (
    <CheckoutThankYouShell
      device={device}
      storeId={storeId}
      storeName={storeName}
      storeUrl={storeUrl}
      headerPosition={headerPosition}
      footerConfig={footerConfig}
      orderSummaryConfig={orderSummaryConfig}
      logo={logo}
      theme={theme}
      typography={typography}
      scrollable={false}
      main={
        <CheckoutThankYouMainContent
          storeId={storeId}
          theme={theme}
          typography={typography}
          device={device}
          footerConfig={footerConfig}
          mainConfig={mainConfig}
          details={details}
          continueShoppingHref="/"
        />
      }
      orderSummary={
        <CheckoutOrderSummaryContent
          lines={lines}
          totals={{ subtotal, shipping, total }}
          orderSummaryConfig={orderSummaryConfig}
          colorPalette={theme?.colorPalette}
          layout={device}
        />
      }
    />
  );
}
