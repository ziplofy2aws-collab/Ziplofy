import React from 'react';
import { CheckoutPolicyModal } from '../policies/CheckoutPolicyModal';
import { useCheckoutPolicyModal } from '../policies/useCheckoutPolicyModal';
import type { CheckoutSignInMainConfig } from '../settings/checkout-settings.types';
import {
  CHECKOUT_DEFAULT_SIGN_IN_MAIN_ACCENT,
  resolveCheckoutColorSetting,
} from '../settings/checkout-settings.types';
import type { CheckoutPaletteTheme } from '../settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import type { CheckoutLogoPreviewConfig } from './CheckoutHeaderRuntimePreview';
import { CheckoutTypographyFontLoader } from './CheckoutTypographyFontLoader';

const inputClassName =
  'w-full rounded-md border border-[#dedede] bg-white px-3.5 py-3.5 text-[15px] text-[#121212] placeholder:text-[#8a8a8a] focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]';

type Props = {
  storeId?: string | null;
  storeName?: string;
  logo?: CheckoutLogoPreviewConfig;
  typography?: CheckoutTypographyTheme;
  theme?: CheckoutPaletteTheme;
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
  const alignment = logo?.alignment ?? 'center';
  const alignClass =
    alignment === 'left' ? 'mr-auto' : alignment === 'right' ? 'ml-auto' : 'mx-auto';
  const textAlignClass =
    alignment === 'left' ? 'text-left' : alignment === 'right' ? 'text-right' : 'text-center';

  if (image) {
    return (
      <img
        src={image}
        alt={storeName}
        className={`block h-auto max-w-full object-contain ${alignClass}`}
        style={{ width: `${width}px` }}
      />
    );
  }

  return (
    <p
      className={`text-[22px] font-semibold tracking-[-0.02em] text-[#121212] ${textAlignClass}`}
      style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
    >
      {storeName}
    </p>
  );
}

export function CheckoutSignupRuntimePreview({
  storeId,
  storeName = 'My Store',
  logo,
  typography,
  theme,
  mainConfig,
  device = 'desktop',
}: Props) {
  const { open, activeTitle, loading, error, content, openPolicy, closePolicy } =
    useCheckoutPolicyModal(storeId);
  const isMobile = device === 'mobile';
  const bodyFontFamily = typography?.bodyFontFamily;
  const headingsFontFamily = typography?.headingsFontFamily;
  const backgroundColor = resolveCheckoutColorSetting(
    mainConfig?.backgroundColor ?? '#ffffff',
    '#ffffff'
  );
  const accentColor = resolveCheckoutColorSetting(
    mainConfig?.accentColor ?? 'default',
    theme?.accentColor ?? CHECKOUT_DEFAULT_SIGN_IN_MAIN_ACCENT
  );
  const signupLogo: CheckoutLogoPreviewConfig | undefined =
    mainConfig?.logoImage?.trim()
      ? { image: mainConfig.logoImage, width: logo?.width ?? 50, alignment: logo?.alignment ?? 'center' }
      : logo;
  const mediaImage = mainConfig?.mediaImage?.trim();
  const policyLinkClass = `underline ${storeId ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`;
  const policyLinkStyle = { color: accentColor, textDecorationColor: accentColor };

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
          <StoreLogo storeName={storeName} logo={signupLogo} headingsFontFamily={headingsFontFamily} />
        </div>

        <div className="flex flex-1 flex-col">
          <h1
            className="text-[28px] font-semibold leading-tight text-[#121212]"
            style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
          >
            Create account
          </h1>
          <p className="mt-2 text-[15px] text-[#707070]">Sign up to shop and track your orders</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <input
              type="text"
              readOnly
              placeholder="First name"
              className={inputClassName}
              aria-label="First name"
            />
            <input
              type="text"
              readOnly
              placeholder="Last name"
              className={inputClassName}
              aria-label="Last name"
            />
          </div>

          <div className="mt-3 space-y-3">
            <input
              type="email"
              readOnly
              placeholder="Email"
              className={inputClassName}
              aria-label="Email"
            />
            <input
              type="password"
              readOnly
              placeholder="Password"
              className={inputClassName}
              aria-label="Password"
            />
          </div>

          <button
            type="button"
            className="mt-6 flex w-full items-center justify-center rounded-md px-4 py-3.5 text-[15px] font-semibold text-white"
            style={{ backgroundColor: accentColor }}
          >
            Create account
          </button>

          <p className="mt-4 text-center text-[14px] text-[#707070]">
            Already have an account?{' '}
            <span className="font-medium underline" style={policyLinkStyle}>
              Sign in
            </span>
          </p>

          <label className="mt-4 flex cursor-default items-start gap-2.5 text-[14px] text-[#121212]">
            <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border border-[#dedede] bg-white" />
            <span className="leading-snug">Email me with news and offers</span>
          </label>

          <p className="mt-6 text-[13px] leading-relaxed text-[#707070]">
            By creating an account, you agree to our{' '}
            {storeId ? (
              <button
                type="button"
                className={`${policyLinkClass} border-0 bg-transparent p-0 font-inherit`}
                onClick={(e) => {
                  e.stopPropagation();
                  void openPolicy('terms', 'Terms of service');
                }}
                style={policyLinkStyle}
              >
                Terms of service
              </button>
            ) : (
              <span className="underline" style={policyLinkStyle}>
                Terms of service
              </span>
            )}
            .
          </p>
        </div>

        <div className="mt-auto pt-10 text-center">
          {storeId ? (
            <button
              type="button"
              className={`text-[14px] ${policyLinkClass} border-0 bg-transparent p-0 font-inherit`}
              onClick={(e) => {
                e.stopPropagation();
                void openPolicy('privacy', 'Privacy policy');
              }}
              style={policyLinkStyle}
            >
              Privacy policy
            </button>
          ) : (
            <span className="text-[14px] underline" style={policyLinkStyle}>
              Privacy policy
            </span>
          )}
        </div>
      </div>

      <CheckoutPolicyModal
        open={open}
        title={activeTitle}
        loading={loading && !content}
        error={error}
        content={content}
        onClose={closePolicy}
      />
    </div>
  );
}
