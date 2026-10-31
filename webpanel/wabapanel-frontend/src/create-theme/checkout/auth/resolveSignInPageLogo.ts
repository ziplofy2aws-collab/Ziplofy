import type { CheckoutSignInMainConfig } from '../settings/checkout-settings.types';
import type { CheckoutLogoPreviewConfig } from '../preview/CheckoutHeaderRuntimePreview';

/** Same logo precedence as checkout editor preview (sign-in main overrides global). */
export function resolveSignInPageLogo(
  mainConfig?: CheckoutSignInMainConfig | null,
  globalLogo?: CheckoutLogoPreviewConfig | null
): CheckoutLogoPreviewConfig | undefined {
  if (mainConfig?.logoImage?.trim()) {
    return {
      image: mainConfig.logoImage,
      width: globalLogo?.width ?? 50,
      alignment: globalLogo?.alignment ?? 'center',
    };
  }
  return globalLogo ?? undefined;
}
