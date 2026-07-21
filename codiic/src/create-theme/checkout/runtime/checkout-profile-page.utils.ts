import {
  readCheckoutFooterConfig,
  readCheckoutGlobalSettings,
  readCheckoutHeaderPosition,
  resolveCheckoutPaletteTheme,
  type CheckoutFooterConfig,
  type CheckoutHeaderPosition,
  type CheckoutPaletteTheme,
} from '../settings/checkout-settings.types';
import { resolveCheckoutTypographyTheme, type CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import type { CheckoutLogoPreviewConfig } from '../preview/CheckoutHeaderRuntimePreview';

export type CheckoutProfilePageAppearance = {
  theme: CheckoutPaletteTheme;
  typography: CheckoutTypographyTheme;
  globalLogo: CheckoutLogoPreviewConfig;
  headerPosition: CheckoutHeaderPosition;
  footerConfig: CheckoutFooterConfig;
};

export function resolveCheckoutProfilePageAppearance(
  checkoutConfig: Record<string, unknown> | null | undefined
): CheckoutProfilePageAppearance {
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
  };
}
