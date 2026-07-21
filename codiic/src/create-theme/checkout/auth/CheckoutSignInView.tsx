import type { ReactNode } from 'react';
import type { CheckoutSignInMainConfig } from '../settings/checkout-settings.types';
import type { CheckoutPaletteTheme } from '../settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import type { CheckoutLogoPreviewConfig } from '../preview/CheckoutHeaderRuntimePreview';
import { CheckoutAuthPageFrame } from './CheckoutAuthPageFrame';
import { CheckoutAuthStoreLogo } from './CheckoutAuthStoreLogo';
import {
  CHECKOUT_AUTH_INPUT_CLASS,
  checkoutAuthLinkStyle,
  resolveCheckoutAuthAccentColor,
} from './checkout-auth-styles';
import { resolveSignInPageLogo } from './resolveSignInPageLogo';

export type CheckoutAuthPolicyType = 'terms' | 'privacy';

type BaseProps = {
  storeId?: string | null;
  storeName?: string;
  logo?: CheckoutLogoPreviewConfig;
  typography?: CheckoutTypographyTheme;
  theme?: CheckoutPaletteTheme;
  mainConfig?: CheckoutSignInMainConfig | null;
  device?: 'desktop' | 'mobile';
  variant?: 'preview' | 'storefront';
  onOpenPolicy?: (type: CheckoutAuthPolicyType, title: string) => void;
  policyModal?: ReactNode;
};

type PreviewProps = BaseProps & {
  mode: 'preview';
};

type LiveProps = BaseProps & {
  mode: 'live';
  email: string;
  password: string;
  marketingOptIn: boolean;
  submitting?: boolean;
  disabled?: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onMarketingOptInChange: (value: boolean) => void;
  onSubmit: () => void;
  forgotPasswordLink?: ReactNode;
  signupLink?: ReactNode;
};

export type CheckoutSignInViewProps = PreviewProps | LiveProps;

function PolicyLink({
  storeId,
  onOpenPolicy,
  type,
  title,
  label,
  className,
  style,
}: {
  storeId?: string | null;
  onOpenPolicy?: (type: CheckoutAuthPolicyType, title: string) => void;
  type: CheckoutAuthPolicyType;
  title: string;
  label: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const canOpen = Boolean(storeId && onOpenPolicy);
  const linkClass = `underline ${canOpen ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`;

  if (canOpen) {
    return (
      <button
        type="button"
        className={`${linkClass} border-0 bg-transparent p-0 font-inherit ${className ?? ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onOpenPolicy!(type, title);
        }}
        style={style}
      >
        {label}
      </button>
    );
  }

  return (
    <span className={`underline ${className ?? ''}`} style={style}>
      {label}
    </span>
  );
}

export function CheckoutSignInView(props: CheckoutSignInViewProps) {
  const {
    storeId,
    storeName = 'My Store',
    logo,
    typography,
    theme,
    mainConfig,
    device = 'desktop',
    variant = props.mode === 'live' ? 'storefront' : 'preview',
    onOpenPolicy,
    policyModal,
  } = props;

  const headingsFontFamily = typography?.headingsFontFamily;
  const accentColor = resolveCheckoutAuthAccentColor(mainConfig, theme);
  const policyLinkStyle = checkoutAuthLinkStyle(accentColor);
  const signInLogo = resolveSignInPageLogo(mainConfig, logo);
  const isPreview = props.mode === 'preview';

  return (
    <>
      <CheckoutAuthPageFrame
        mainConfig={mainConfig}
        typography={typography}
        device={device}
        variant={variant}
      >
        <div className="mb-10">
          <CheckoutAuthStoreLogo
            storeName={storeName}
            logo={signInLogo}
            headingsFontFamily={headingsFontFamily}
          />
        </div>

        <div className="flex flex-1 flex-col">
          <h1
            className="text-[28px] font-semibold leading-tight text-[#121212]"
            style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
          >
            Sign in
          </h1>
          <p className="mt-2 text-[15px] text-[#707070]">Sign in or create an account</p>

          {isPreview ? (
            <>
              <div className="mt-6 space-y-3">
                <input
                  type="email"
                  readOnly
                  placeholder="Email"
                  className={CHECKOUT_AUTH_INPUT_CLASS}
                  aria-label="Email"
                />
                <input
                  type="password"
                  readOnly
                  placeholder="Password"
                  className={CHECKOUT_AUTH_INPUT_CLASS}
                  aria-label="Password"
                />
              </div>

              <p className="mt-3 text-right text-[13px]">
                <span className="underline" style={policyLinkStyle}>
                  Forgot password?
                </span>
              </p>

              <button
                type="button"
                className="mt-4 flex w-full items-center justify-center rounded-md px-4 py-3.5 text-[15px] font-semibold text-white"
                style={{ backgroundColor: accentColor }}
              >
                Sign in
              </button>

              <p className="mt-4 text-center text-[14px] text-[#707070]">
                Don&apos;t have an account?{' '}
                <span className="font-medium underline" style={policyLinkStyle}>
                  Create account
                </span>
              </p>

              <label className="mt-4 flex cursor-default items-start gap-2.5 text-[14px] text-[#121212]">
                <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border border-[#dedede] bg-white" />
                <span className="leading-snug">Email me with news and offers</span>
              </label>
            </>
          ) : (
            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                props.onSubmit();
              }}
            >
              <div className="space-y-3">
                <input
                  type="email"
                  value={props.email}
                  onChange={(e) => props.onEmailChange(e.target.value)}
                  placeholder="Email"
                  className={CHECKOUT_AUTH_INPUT_CLASS}
                  aria-label="Email"
                  autoComplete="email"
                  required
                />
                <input
                  type="password"
                  value={props.password}
                  onChange={(e) => props.onPasswordChange(e.target.value)}
                  placeholder="Password"
                  className={CHECKOUT_AUTH_INPUT_CLASS}
                  aria-label="Password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <p className="mt-3 text-right text-[13px]">
                {props.forgotPasswordLink ?? (
                  <span className="underline" style={policyLinkStyle}>
                    Forgot password?
                  </span>
                )}
              </p>

              <button
                type="submit"
                disabled={props.disabled || props.submitting}
                className="mt-4 flex w-full items-center justify-center rounded-md px-4 py-3.5 text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: accentColor }}
              >
                {props.submitting ? 'Signing in…' : 'Sign in'}
              </button>

              <p className="mt-4 text-center text-[14px] text-[#707070]">
                Don&apos;t have an account?{' '}
                {props.signupLink ?? (
                  <span className="font-medium underline" style={policyLinkStyle}>
                    Create account
                  </span>
                )}
              </p>

              <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[14px] text-[#121212]">
                <input
                  type="checkbox"
                  checked={props.marketingOptIn}
                  onChange={(e) => props.onMarketingOptInChange(e.target.checked)}
                  className="mt-0.5 h-[18px] w-[18px] shrink-0 rounded-[4px] border border-[#dedede] accent-[#005bd3]"
                />
                <span className="leading-snug">Email me with news and offers</span>
              </label>
            </form>
          )}

          <p className="mt-6 text-[13px] leading-relaxed text-[#707070]">
            By continuing, you agree to our{' '}
            <PolicyLink
              storeId={storeId}
              onOpenPolicy={onOpenPolicy}
              type="terms"
              title="Terms of service"
              label="Terms of service"
              style={policyLinkStyle}
            />
            .
          </p>
        </div>

        <div className="mt-auto pt-10 text-center">
          <PolicyLink
            storeId={storeId}
            onOpenPolicy={onOpenPolicy}
            type="privacy"
            title="Privacy policy"
            label="Privacy policy"
            className="text-[14px]"
            style={policyLinkStyle}
          />
        </div>
      </CheckoutAuthPageFrame>
      {policyModal}
    </>
  );
}
