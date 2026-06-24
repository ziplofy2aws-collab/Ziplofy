import {
  readCheckoutFooterConfig,
  readCheckoutGlobalSettings,
  readCheckoutHeaderPosition,
  readCheckoutOrderSummaryConfig,
  readCheckoutThankYouMainConfig,
  resolveCheckoutPaletteTheme,
  type CheckoutFooterConfig,
  type CheckoutHeaderPosition,
  type CheckoutOrderSummaryConfig,
  type CheckoutPaletteTheme,
  type CheckoutThankYouMainConfig,
} from '../settings/checkout-settings.types';
import { resolveCheckoutTypographyTheme, type CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import type { CheckoutLogoPreviewConfig } from '../preview/CheckoutHeaderRuntimePreview';

export type CheckoutThankYouPageAppearance = {
  theme: CheckoutPaletteTheme;
  typography: CheckoutTypographyTheme;
  globalLogo: CheckoutLogoPreviewConfig;
  headerPosition: CheckoutHeaderPosition;
  footerConfig: CheckoutFooterConfig;
  orderSummaryConfig: Required<CheckoutOrderSummaryConfig>;
  thankYouMain: Required<CheckoutThankYouMainConfig>;
};

export function resolveCheckoutThankYouPageAppearance(
  checkoutConfig: Record<string, unknown> | null | undefined
): CheckoutThankYouPageAppearance {
  const config = checkoutConfig ?? {};
  const global = readCheckoutGlobalSettings(config);
  return {
    theme: resolveCheckoutPaletteTheme(global),
    typography: resolveCheckoutTypographyTheme(global),
    globalLogo: {
      image: global.logoImage?.trim() || null,
      width: global.logoWidth,
      alignment: global.logoAlignment,
    },
    headerPosition: readCheckoutHeaderPosition(config),
    footerConfig: readCheckoutFooterConfig(config),
    orderSummaryConfig: readCheckoutOrderSummaryConfig(config),
    thankYouMain: readCheckoutThankYouMainConfig(config),
  };
}
