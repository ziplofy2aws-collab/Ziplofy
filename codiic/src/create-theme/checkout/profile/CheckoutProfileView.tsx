import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { CheckoutFooterConfig, CheckoutHeaderPosition, CheckoutPaletteTheme } from '../settings/checkout-settings.types';
import { CHECKOUT_ACCOUNT_MAX_WIDTH_CLASS } from '../settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import { formatCheckoutPrice } from '../utils/format-checkout-price';
import { CheckoutFooterRuntimePreview } from '../preview/CheckoutFooterRuntimePreview';
import { CheckoutHeaderRuntimePreview, type CheckoutLogoPreviewConfig } from '../preview/CheckoutHeaderRuntimePreview';
import { CheckoutTypographyFontLoader } from '../preview/CheckoutTypographyFontLoader';
import type { CheckoutProfileViewData } from './checkout-profile.types';
import { CHECKOUT_EXAMPLE_PROFILE } from './checkout-profile.types';
import { CHECKOUT_STOREFRONT_ROOT_CLASS } from '../checkout-storefront.constants';

type PreviewDevice = 'desktop' | 'mobile';

type BaseProps = {
  device?: PreviewDevice;
  storeId?: string | null;
  storeName?: string;
  storeUrl?: string | null;
  headerPosition?: CheckoutHeaderPosition;
  footerConfig?: CheckoutFooterConfig;
  logo?: CheckoutLogoPreviewConfig;
  theme?: CheckoutPaletteTheme;
  typography?: CheckoutTypographyTheme;
  variant?: 'preview' | 'storefront';
  highlightNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
};

type PreviewProps = BaseProps & {
  mode: 'preview';
};

type LiveProps = BaseProps & {
  mode: 'live';
  profile: CheckoutProfileViewData;
  ordersHref?: string;
  loading?: boolean;
  addressesLoading?: boolean;
  onEditProfile?: () => void;
  onAddAddress?: () => void;
  onAddressClick?: (addressId: string) => void;
  onMarketingToggle?: (enabled: boolean) => void;
  onSmsMarketingToggle?: (enabled: boolean) => void;
  marketingUpdating?: boolean;
  smsMarketingUpdating?: boolean;
};

export type CheckoutProfileViewProps = PreviewProps | LiveProps;

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M7.5 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function AccountNav({
  isMobile,
  headingsFontFamily,
  ordersHref,
  variant,
}: {
  isMobile: boolean;
  headingsFontFamily?: string;
  ordersHref?: string;
  variant: 'preview' | 'storefront';
}) {
  return (
    <nav
      className={`shrink-0 ${
        isMobile
          ? 'mb-6 border-b border-[#dedede] pb-4'
          : variant === 'storefront'
            ? 'checkout-account-nav'
            : 'w-[148px]'
      }`}
      aria-label="Account"
    >
      {ordersHref ? (
        <Link to={ordersHref} className="text-[14px] text-[#707070] hover:underline">
          Orders
        </Link>
      ) : (
        <span className="text-[14px] text-[#707070]">Orders</span>
      )}
      <h1
        className={`font-semibold leading-tight text-[#121212] ${isMobile ? 'mt-2 text-[24px]' : 'mt-3 text-[28px]'}`}
        style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
      >
        Profile
      </h1>
    </nav>
  );
}

function ProfileSection({
  title,
  actionLabel,
  onAction,
  accentColor = '#005bd3',
  children,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  accentColor?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-[#dedede] py-6 first:pt-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold text-[#121212]">{title}</h2>
        {actionLabel ? (
          <button
            type="button"
            className="pointer-events-auto text-[14px] font-medium"
            style={{ color: accentColor }}
            onClick={onAction}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function AddressCard({
  address,
  onClick,
}: {
  address: CheckoutProfileViewData['addresses'][number];
  onClick?: () => void;
}) {
  const className =
    'flex w-full items-center gap-3 rounded-md border border-[#dedede] bg-white px-4 py-4 text-left pointer-events-auto';

  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-medium text-[#121212]">{address.name}</span>
          {address.isDefault ? (
            <span className="rounded bg-[#f1f1f1] px-2 py-0.5 text-[11px] font-medium text-[#707070]">
              Default
            </span>
          ) : null}
        </div>
        <div className="mt-2 space-y-0.5">
          {address.lines.map((line) => (
            <p key={line} className="text-[14px] leading-relaxed text-[#707070]">
              {line}
            </p>
          ))}
        </div>
      </div>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-[#707070]" />
    </>
  );

  if (!onClick) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <button type="button" className={`${className} cursor-pointer`} onClick={onClick}>
      {inner}
    </button>
  );
}

function MarketingToggleRow({
  label,
  icon,
  enabled,
  disabled,
  accentColor = '#005bd3',
  onChange,
}: {
  label: string;
  icon: ReactNode;
  enabled: boolean;
  disabled?: boolean;
  accentColor?: string;
  onChange?: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-[#dedede] bg-white px-4 py-3">
      <span className="inline-flex items-center gap-3 text-[14px] text-[#121212]">
        {icon}
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
          enabled ? '' : 'bg-[#dedede]'
        } disabled:cursor-not-allowed disabled:opacity-60`}
        style={enabled ? { backgroundColor: accentColor } : undefined}
        onClick={() => onChange?.(!enabled)}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? 'right-0.5' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export function CheckoutProfileView(props: CheckoutProfileViewProps) {
  const {
    device = 'desktop',
    storeId,
    storeName = 'My Store',
    storeUrl,
    headerPosition = 'checkout_form',
    footerConfig,
    logo,
    theme,
    typography,
    variant = props.mode === 'live' ? 'storefront' : 'preview',
    highlightNodeId,
    onSelectNode,
  } = props;

  const isMobile = device === 'mobile';
  const isPreview = props.mode === 'preview';
  const live = props.mode === 'live' ? props : null;
  const profile = isPreview ? CHECKOUT_EXAMPLE_PROFILE : props.profile;
  const isFullWidthHeader = headerPosition === 'full_width';
  const isFullWidthFooter = (footerConfig?.location ?? 'checkout_form') === 'full_width';
  const headingsFontFamily = typography?.headingsFontFamily;
  const bodyFontFamily = typography?.bodyFontFamily;
  const mainHighlighted = highlightNodeId === 'checkout:profile:group:main';
  const ordersHref = !isPreview ? (props.ordersHref ?? '/my-orders') : undefined;
  const accentColor = theme?.buttonColor ?? theme?.accentColor ?? '#005bd3';
  const pageLoading = Boolean(live?.loading);
  const addressesLoading = Boolean(live?.addressesLoading);
  const showStoreCredit = isPreview || profile.showStoreCredit;

  const outerClass =
    variant === 'storefront'
      ? `${CHECKOUT_STOREFRONT_ROOT_CLASS} checkout-storefront-account pointer-events-auto flex min-h-screen flex-col bg-white`
      : 'flex h-full min-h-0 flex-col overflow-hidden bg-white';

  const scrollClass =
    variant === 'storefront'
      ? 'checkout-account-scroll pointer-events-auto w-full'
      : 'checkout-preview-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain';

  const headerSlot = (
    <div
      className="shrink-0 border-b border-[#e1e3e5]"
      style={{ backgroundColor: theme?.headerBackgroundColor ?? '#ffffff' }}
    >
      <div className={isMobile ? 'w-full' : `mx-auto w-full ${CHECKOUT_ACCOUNT_MAX_WIDTH_CLASS}`}>
        <CheckoutHeaderRuntimePreview
          storeName={storeName}
          storeUrl={storeUrl}
          logo={logo}
          theme={theme}
          device={device}
          highlightNodeId={highlightNodeId}
          onSelectNode={onSelectNode}
        />
      </div>
    </div>
  );

  const mainContent = (
    <div
      className={
        variant === 'storefront' && !isMobile
          ? 'checkout-account-layout'
          : isMobile
            ? 'flex flex-col'
            : 'flex gap-10'
      }
    >
      <AccountNav
        isMobile={isMobile}
        headingsFontFamily={headingsFontFamily}
        ordersHref={ordersHref}
        variant={variant}
      />

      <div
        className={`${variant === 'storefront' ? 'checkout-account-main pointer-events-auto ' : ''}min-w-0 flex-1`}
      >
        <ProfileSection
          title={profile.customerName}
          actionLabel="Edit"
          accentColor={accentColor}
          onAction={live?.onEditProfile}
        >
          <dl className="space-y-4">
            <div>
              <dt className="text-[13px] text-[#707070]">Email</dt>
              <dd className="mt-1 text-[14px] text-[#121212]">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-[#707070]">Phone number</dt>
              <dd className="mt-1 text-[14px] text-[#121212]">
                {profile.phone || '—'}
              </dd>
            </div>
          </dl>
        </ProfileSection>

        <ProfileSection
          title="Addresses"
          actionLabel="Add"
          accentColor={accentColor}
          onAction={live?.onAddAddress}
        >
          {pageLoading || addressesLoading ? (
            <p className="text-[14px] text-[#707070]">Loading addresses…</p>
          ) : profile.addresses.length === 0 ? (
            <p className="text-[14px] text-[#707070]">No addresses saved yet.</p>
          ) : (
            <div className="space-y-3">
              {profile.addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onClick={live?.onAddressClick ? () => live.onAddressClick!(address.id) : undefined}
                />
              ))}
            </div>
          )}
        </ProfileSection>

        {showStoreCredit ? (
          <ProfileSection title="Payment methods">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md border border-[#dedede] bg-white px-4 py-3 text-left"
            >
              <CreditCardIcon className="h-5 w-5 shrink-0 text-[#707070]" />
              <span className="min-w-0 flex-1 text-[14px] text-[#121212]">Store credit</span>
              <span className="text-[14px] text-[#707070]">INR</span>
              <span className="text-[14px] font-medium text-[#121212]">
                {formatCheckoutPrice(profile.storeCredit)}
              </span>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-[#707070]" />
            </button>
          </ProfileSection>
        ) : null}

        <ProfileSection title="Marketing preferences">
          <div className="space-y-3">
            <MarketingToggleRow
              label="Email"
              icon={<EnvelopeIcon className="h-5 w-5 text-[#707070]" />}
              enabled={profile.marketingEmailOptIn}
              accentColor={accentColor}
              disabled={Boolean(live?.marketingUpdating)}
              onChange={live?.onMarketingToggle}
            />
            <MarketingToggleRow
              label="SMS"
              icon={
                <svg className="h-5 w-5 text-[#707070]" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M7 8h10M7 12h6M5 5h14a2 2 0 012 2v8l-3-2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              enabled={profile.marketingSmsOptIn}
              accentColor={accentColor}
              disabled={Boolean(live?.smsMarketingUpdating)}
              onChange={live?.onSmsMarketingToggle}
            />
          </div>
        </ProfileSection>

        {(footerConfig?.location ?? 'checkout_form') !== 'full_width' ? (
          <CheckoutFooterRuntimePreview
            storeId={storeId}
            alignment={footerConfig?.alignment ?? 'left'}
            accentColor={theme?.accentColor}
            device={device}
            highlightNodeId={highlightNodeId}
            onSelectNode={onSelectNode}
            constrained
            constrainedMaxWidthClass={CHECKOUT_ACCOUNT_MAX_WIDTH_CLASS}
          />
        ) : null}
      </div>
    </div>
  );

  return (
    <div className={outerClass}>
      <CheckoutTypographyFontLoader
        fonts={[typography?.headingGoogleFont, typography?.bodyGoogleFont]}
      />

      {isFullWidthHeader ? headerSlot : null}

      <div className={scrollClass}>
        <div
          className={`mx-auto w-full ${isMobile ? 'max-w-none' : CHECKOUT_ACCOUNT_MAX_WIDTH_CLASS}`}
          style={bodyFontFamily ? { fontFamily: bodyFontFamily } : undefined}
        >
          {!isFullWidthHeader ? headerSlot : null}

          {onSelectNode ? (
            <div
              className={`w-full select-none ${isMobile ? 'px-4 py-6' : 'px-6 py-8 sm:px-8'} cursor-pointer ${
                mainHighlighted ? 'ring-2 ring-inset ring-[#005bd3]' : ''
              }`}
              style={{ backgroundColor: theme?.mainBackgroundColor ?? '#ffffff' }}
              data-checkout-node-id="checkout:profile:group:main"
              data-checkout-selectable="true"
              onClick={(e) => {
                onSelectNode('checkout:profile:group:main');
                e.stopPropagation();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectNode('checkout:profile:group:main');
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className={mainHighlighted ? 'pointer-events-none' : ''}>{mainContent}</div>
            </div>
          ) : (
            <div
              className={`w-full pointer-events-auto ${isMobile ? 'px-4 py-6' : 'px-6 py-8 sm:px-8'}`}
              style={{ backgroundColor: theme?.mainBackgroundColor ?? '#ffffff' }}
            >
              {mainContent}
            </div>
          )}
        </div>
      </div>

      {isFullWidthFooter ? (
        <CheckoutFooterRuntimePreview
          storeId={storeId}
          alignment={footerConfig?.alignment ?? 'left'}
          accentColor={theme?.accentColor}
          device={device}
          highlightNodeId={highlightNodeId}
          onSelectNode={onSelectNode}
        />
      ) : null}
    </div>
  );
}
