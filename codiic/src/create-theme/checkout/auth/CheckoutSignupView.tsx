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
import type { CheckoutAuthPolicyType } from './CheckoutSignInView';

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
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  marketingOptIn: boolean;
  submitting?: boolean;
  disabled?: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onMarketingOptInChange: (value: boolean) => void;
  onSubmit: () => void;
  signInLink?: ReactNode;
};

export type CheckoutSignupViewProps = PreviewProps | LiveProps;

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

export function CheckoutSignupView(props: CheckoutSignupViewProps) {
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
  const signupLogo = resolveSignInPageLogo(mainConfig, logo);
  const policyLinkStyle = checkoutAuthLinkStyle(accentColor);
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
            logo={signupLogo}
            headingsFontFamily={headingsFontFamily}
          />
        </div>

        <div className="flex flex-1 flex-col">
          <h1
            className="text-[28px] font-semibold leading-tight text-[#121212]"
            style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
          >
            Create account
          </h1>
          <p className="mt-2 text-[15px] text-[#707070]">Sign up to shop and track your orders</p>

          {isPreview ? (
            <>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <input
                  type="text"
                  readOnly
                  placeholder="First name"
                  className={CHECKOUT_AUTH_INPUT_CLASS}
                  aria-label="First name"
                />
                <input
                  type="text"
                  readOnly
                  placeholder="Last name"
                  className={CHECKOUT_AUTH_INPUT_CLASS}
                  aria-label="Last name"
                />
              </div>

              <div className="mt-3 space-y-3">
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
            </>
          ) : (
            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                props.onSubmit();
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={props.firstName}
                  onChange={(e) => props.onFirstNameChange(e.target.value)}
                  placeholder="First name"
                  className={CHECKOUT_AUTH_INPUT_CLASS}
                  aria-label="First name"
                  autoComplete="given-name"
                  required
                />
                <input
                  type="text"
                  value={props.lastName}
                  onChange={(e) => props.onLastNameChange(e.target.value)}
                  placeholder="Last name"
                  className={CHECKOUT_AUTH_INPUT_CLASS}
                  aria-label="Last name"
                  autoComplete="family-name"
                  required
                />
              </div>

              <div className="mt-3 space-y-3">
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
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={props.disabled || props.submitting}
                className="mt-6 flex w-full items-center justify-center rounded-md px-4 py-3.5 text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: accentColor }}
              >
                {props.submitting ? 'Creating account…' : 'Create account'}
              </button>

              <p className="mt-4 text-center text-[14px] text-[#707070]">
                Already have an account?{' '}
                {props.signInLink ?? (
                  <span className="font-medium underline" style={policyLinkStyle}>
                    Sign in
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
            By creating an account, you agree to our{' '}
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
