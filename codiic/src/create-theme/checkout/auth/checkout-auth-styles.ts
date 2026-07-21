import type { CheckoutSignInMainConfig } from '../settings/checkout-settings.types';
import {
  CHECKOUT_DEFAULT_SIGN_IN_MAIN_ACCENT,
  resolveCheckoutColorSetting,
  type CheckoutPaletteTheme,
} from '../settings/checkout-settings.types';

export const CHECKOUT_AUTH_INPUT_CLASS =
  'w-full rounded-md border border-[#dedede] bg-white px-3.5 py-3.5 text-[15px] text-[#121212] placeholder:text-[#8a8a8a] focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]';

export function resolveCheckoutAuthAccentColor(
  mainConfig?: CheckoutSignInMainConfig | null,
  theme?: CheckoutPaletteTheme
): string {
  return resolveCheckoutColorSetting(
    mainConfig?.accentColor ?? 'default',
    theme?.accentColor ?? CHECKOUT_DEFAULT_SIGN_IN_MAIN_ACCENT
  );
}

export function checkoutAuthLinkStyle(accentColor: string) {
  return { color: accentColor, textDecorationColor: accentColor };
}
