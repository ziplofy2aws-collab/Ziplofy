import type { ReactNode } from 'react';
import type { CheckoutSignInMainConfig } from '../settings/checkout-settings.types';
import {
  resolveCheckoutColorSetting,
} from '../settings/checkout-settings.types';
import type { CheckoutPaletteTheme } from '../settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import { CheckoutTypographyFontLoader } from '../preview/CheckoutTypographyFontLoader';
import { CHECKOUT_STOREFRONT_ROOT_CLASS } from '../checkout-storefront.constants';

type Props = {
  mainConfig?: CheckoutSignInMainConfig | null;
  typography?: CheckoutTypographyTheme;
  device?: 'desktop' | 'mobile';
  /** Editor preview sits inside a framed panel; storefront uses full viewport. */
  variant?: 'preview' | 'storefront';
  children: ReactNode;
};

export function CheckoutAuthPageFrame({
  mainConfig,
  typography,
  device = 'desktop',
  variant = 'preview',
  children,
}: Props) {
  const isMobile = device === 'mobile';
  const bodyFontFamily = typography?.bodyFontFamily;
  const backgroundColor = resolveCheckoutColorSetting(
    mainConfig?.backgroundColor ?? '#ffffff',
    '#ffffff'
  );
  const mediaImage = mainConfig?.mediaImage?.trim();

  const outerClass =
    variant === 'storefront'
      ? `${CHECKOUT_STOREFRONT_ROOT_CLASS} relative flex min-h-screen w-full flex-col overflow-y-auto overscroll-contain`
      : 'checkout-preview-scroll relative flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain';

  const innerClass =
    variant === 'storefront'
      ? `relative mx-auto flex w-full flex-1 flex-col px-6 ${
          isMobile ? 'max-w-[390px] py-8' : 'max-w-[480px] py-12 sm:px-8 sm:py-14'
        }`
      : `relative mx-auto flex w-full flex-1 flex-col px-6 ${
          isMobile ? 'max-w-[390px] py-8' : 'max-w-[480px] py-12 sm:px-8 sm:py-14'
        }`;

  return (
    <div
      className={outerClass}
      style={{
        backgroundColor,
        ...(bodyFontFamily ? { fontFamily: bodyFontFamily } : {}),
      }}
    >
      {mediaImage ? (
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${mediaImage})` }}
          aria-hidden
        />
      ) : null}
      <CheckoutTypographyFontLoader
        fonts={[typography?.headingGoogleFont, typography?.bodyGoogleFont]}
      />
      <div className={innerClass}>{children}</div>
    </div>
  );
}
