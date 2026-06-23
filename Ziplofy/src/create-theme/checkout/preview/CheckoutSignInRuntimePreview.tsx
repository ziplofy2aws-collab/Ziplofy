import { ArrowRightIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { CheckoutSignInMainConfig } from '../settings/checkout-settings.types';
import { resolveCheckoutColorSetting } from '../settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import type { CheckoutLogoPreviewConfig } from './CheckoutHeaderRuntimePreview';
import { CheckoutTypographyFontLoader } from './CheckoutTypographyFontLoader';

const SHOP_PURPLE = '#5433eb';

type Props = {
  storeName?: string;
  logo?: CheckoutLogoPreviewConfig;
  typography?: CheckoutTypographyTheme;
  mainConfig?: CheckoutSignInMainConfig;
  device?: 'desktop' | 'mobile';
};

function StoreLogo({
  storeName,
  logo,
  headingsFontFamily,
}: {
  storeName: string;
  logo?: CheckoutLogoPreviewConfig;
  headingsFontFamily?: string;
}) {
  const image = logo?.image?.trim();
  const width = logo?.width ?? 50;

  if (image) {
    return (
      <img
        src={image}
        alt={storeName}
        className="mx-auto h-auto max-h-16 object-contain"
        style={{ width: `${width}px` }}
      />
    );
  }

  return (
    <p
      className="text-center text-[22px] font-semibold tracking-[-0.02em] text-[#121212]"
      style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
    >
      {storeName}
    </p>
  );
}

export function CheckoutSignInRuntimePreview({
  storeName = 'My Store',
  logo,
  typography,
  mainConfig,
  device = 'desktop',
}: Props) {
  const isMobile = device === 'mobile';
  const bodyFontFamily = typography?.bodyFontFamily;
  const headingsFontFamily = typography?.headingsFontFamily;
  const backgroundColor = resolveCheckoutColorSetting(
    mainConfig?.backgroundColor ?? '#ffffff',
    '#ffffff'
  );
  const accentColor = resolveCheckoutColorSetting(
    mainConfig?.accentColor ?? 'default',
    '#1773b0'
  );
  const signInLogo: CheckoutLogoPreviewConfig | undefined =
    mainConfig?.logoImage?.trim()
      ? { image: mainConfig.logoImage, width: logo?.width ?? 50, alignment: logo?.alignment ?? 'center' }
      : logo;
  const mediaImage = mainConfig?.mediaImage?.trim();

  return (
    <div
      className="checkout-preview-scroll relative flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain"
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

      <div
        className={`relative mx-auto flex w-full flex-1 flex-col px-6 ${
          isMobile ? 'max-w-[390px] py-8' : 'max-w-[480px] py-12 sm:px-8 sm:py-14'
        }`}
      >
        <div className="mb-10">
          <StoreLogo storeName={storeName} logo={signInLogo} headingsFontFamily={headingsFontFamily} />
        </div>

        <div className="flex flex-1 flex-col">
          <h1
            className="text-[28px] font-semibold leading-tight text-[#121212]"
            style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
          >
            Sign in
          </h1>
          <p className="mt-2 text-[15px] text-[#707070]">Sign in or create an account</p>

          <button
            type="button"
            className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-md px-4 py-3.5 text-[15px] font-medium text-white"
            style={{ backgroundColor: SHOP_PURPLE }}
          >
            Continue with <span className="font-bold tracking-tight">shop</span>
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#dedede]" />
            <span className="text-[13px] text-[#707070]">or</span>
            <div className="h-px flex-1 bg-[#dedede]" />
          </div>

          <div className="relative">
            <input
              type="email"
              readOnly
              placeholder="Email"
              className="w-full rounded-md border border-[#dedede] bg-white py-3.5 pl-3.5 pr-12 text-[15px] text-[#121212] placeholder:text-[#8a8a8a] focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
              aria-label="Email"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#707070]">
              <ArrowRightIcon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
          </div>

          <label className="mt-4 flex cursor-default items-start gap-2.5 text-[14px] text-[#121212]">
            <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border border-[#dedede] bg-white" />
            <span className="leading-snug">Email me with news and offers</span>
          </label>

          <p className="mt-6 text-[13px] leading-relaxed text-[#707070]">
            By continuing, you agree to our{' '}
            <span
              className="underline"
              style={{ color: accentColor, textDecorationColor: accentColor }}
            >
              Terms of service
            </span>
            .
          </p>
        </div>

        <div className="mt-auto pt-10 text-center">
          <span
            className="text-[14px] underline"
            style={{ color: accentColor, textDecorationColor: accentColor }}
          >
            Privacy policy
          </span>
        </div>
      </div>
    </div>
  );
}
