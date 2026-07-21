import {
  readCheckoutGlobalSettings,
  readCheckoutSignInMainConfig,
  resolveCheckoutPaletteTheme,
  type CheckoutPaletteTheme,
  type CheckoutSignInMainConfig,
} from '../settings/checkout-settings.types';
import { resolveCheckoutTypographyTheme, type CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import type { CheckoutLogoPreviewConfig } from '../preview/CheckoutHeaderRuntimePreview';

export type CheckoutAuthPageAppearance = {
  signInMain: Required<CheckoutSignInMainConfig>;
  theme: CheckoutPaletteTheme;
  typography: CheckoutTypographyTheme;
  /** Global logo from checkout settings (same prop as checkout editor preview). */
  globalLogo: CheckoutLogoPreviewConfig;
};

export function resolveCheckoutAuthPageAppearance(
  checkoutConfig: Record<string, unknown> | null | undefined
): CheckoutAuthPageAppearance {
  const config = checkoutConfig ?? {};
  const signInMain = readCheckoutSignInMainConfig(config);
  const global = readCheckoutGlobalSettings(config);
  const theme = resolveCheckoutPaletteTheme(global);
  const typography = resolveCheckoutTypographyTheme(global);
  const globalLogo: CheckoutLogoPreviewConfig = {
    image: global.logoImage?.trim() || null,
    width: global.logoWidth,
    alignment: global.logoAlignment,
  };
  return { signInMain, theme, typography, globalLogo };
}
