import {
  ChevronRightIcon,
  CreditCardIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import type { CheckoutFooterConfig, CheckoutHeaderPosition, CheckoutPaletteTheme } from '../settings/checkout-settings.types';
import { CHECKOUT_FORM_MAX_WIDTH_CLASS } from '../settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import { formatCheckoutPrice } from '../utils/format-checkout-price';
import { CheckoutFooterRuntimePreview } from './CheckoutFooterRuntimePreview';
import { CheckoutHeaderRuntimePreview, type CheckoutLogoPreviewConfig } from './CheckoutHeaderRuntimePreview';
import { CheckoutTypographyFontLoader } from './CheckoutTypographyFontLoader';

type PreviewDevice = 'desktop' | 'mobile';

const CUSTOMER_NAME = 'Effie Fay';
const CUSTOMER_EMAIL = 'effie.fay@example.com';
const CUSTOMER_PHONE = '+91 11 2327 7705';
const ADDRESS_NAME = 'Maxie Ullrich';
const ADDRESS_LINES = [
  'Netaji Subhash Marg, Lal Qila, Chandni Chowk',
  '110006 New Delhi Delhi',
  'India',
];

type Props = {
  device?: PreviewDevice;
  storeName?: string;
  storeUrl?: string | null;
  headerPosition?: CheckoutHeaderPosition;
  footerConfig?: CheckoutFooterConfig;
  logo?: CheckoutLogoPreviewConfig;
  theme?: CheckoutPaletteTheme;
  typography?: CheckoutTypographyTheme;
  highlightNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
};

function AccountNav({
  isMobile,
  headingsFontFamily,
}: {
  isMobile: boolean;
  headingsFontFamily?: string;
}) {
  return (
    <nav
      className={`shrink-0 ${isMobile ? 'mb-6 border-b border-[#dedede] pb-4' : 'w-[148px]'}`}
      aria-label="Account"
    >
      <span className="text-[14px] text-[#707070]">Orders</span>
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
  children,
}: {
  title: string;
  actionLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-[#dedede] py-6 first:pt-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold text-[#121212]">{title}</h2>
        {actionLabel ? (
          <button type="button" className="text-[14px] font-medium text-[#005bd3]">
            {actionLabel}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function AddressCard({ isDefault }: { isDefault?: boolean }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-md border border-[#dedede] bg-white px-4 py-4 text-left"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-medium text-[#121212]">{ADDRESS_NAME}</span>
          {isDefault ? (
            <span className="rounded bg-[#f1f1f1] px-2 py-0.5 text-[11px] font-medium text-[#707070]">
              Default
            </span>
          ) : null}
        </div>
        <div className="mt-2 space-y-0.5">
          {ADDRESS_LINES.map((line) => (
            <p key={line} className="text-[14px] leading-relaxed text-[#707070]">
              {line}
            </p>
          ))}
        </div>
      </div>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-[#707070]" aria-hidden />
    </button>
  );
}

function MarketingToggleRow() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-[#dedede] bg-white px-4 py-3">
      <span className="inline-flex items-center gap-3 text-[14px] text-[#121212]">
        <EnvelopeIcon className="h-5 w-5 text-[#707070]" aria-hidden />
        Email
      </span>
      <span
        className="relative inline-flex h-6 w-11 shrink-0 rounded-full bg-[#005bd3]"
        aria-hidden
      >
        <span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm" />
      </span>
    </div>
  );
}

export function CheckoutAccountProfileRuntimePreview({
  device = 'desktop',
  storeName = 'My Store',
  storeUrl,
  headerPosition = 'checkout_form',
  footerConfig,
  logo,
  theme,
  typography,
  highlightNodeId,
  onSelectNode,
}: Props) {
  const isMobile = device === 'mobile';
  const isFullWidthHeader = headerPosition === 'full_width';
  const isFullWidthFooter = (footerConfig?.location ?? 'checkout_form') === 'full_width';
  const headingsFontFamily = typography?.headingsFontFamily;
  const bodyFontFamily = typography?.bodyFontFamily;
  const mainHighlighted = highlightNodeId === 'checkout:profile:group:main';

  const headerSlot = (
    <div
      className="shrink-0 border-b border-[#e1e3e5]"
      style={{ backgroundColor: theme?.headerBackgroundColor ?? '#ffffff' }}
    >
      <div className={isMobile ? 'w-full' : `mx-auto w-full ${CHECKOUT_FORM_MAX_WIDTH_CLASS}`}>
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

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <CheckoutTypographyFontLoader
        fonts={[typography?.headingGoogleFont, typography?.bodyGoogleFont]}
      />

      {isFullWidthHeader ? headerSlot : null}

      <div className="checkout-preview-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div
          className={`mx-auto w-full ${isMobile ? 'max-w-none' : CHECKOUT_FORM_MAX_WIDTH_CLASS}`}
          style={bodyFontFamily ? { fontFamily: bodyFontFamily } : undefined}
        >
          {!isFullWidthHeader ? headerSlot : null}

          <div
            className={`w-full select-none ${isMobile ? 'px-4 py-6' : 'px-6 py-8 sm:px-8'} ${
              onSelectNode ? 'cursor-pointer' : ''} ${
              mainHighlighted ? 'ring-2 ring-inset ring-[#005bd3]' : ''
            }`}
            style={{ backgroundColor: theme?.mainBackgroundColor ?? '#ffffff' }}
            data-checkout-node-id="checkout:profile:group:main"
            data-checkout-selectable={onSelectNode ? 'true' : undefined}
            onClick={(e) => {
              onSelectNode?.('checkout:profile:group:main');
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              if (!onSelectNode) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectNode('checkout:profile:group:main');
              }
            }}
            role={onSelectNode ? 'button' : undefined}
            tabIndex={onSelectNode ? 0 : undefined}
          >
            <div
              className={`${isMobile ? 'flex flex-col' : 'flex gap-10'} ${
                mainHighlighted ? 'pointer-events-none' : ''
              }`}
            >
              <AccountNav isMobile={isMobile} headingsFontFamily={headingsFontFamily} />

              <div className="min-w-0 flex-1">
                <ProfileSection title={CUSTOMER_NAME} actionLabel="Edit">
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-[13px] text-[#707070]">Email</dt>
                      <dd className="mt-1 text-[14px] text-[#121212]">{CUSTOMER_EMAIL}</dd>
                    </div>
                    <div>
                      <dt className="text-[13px] text-[#707070]">Phone number</dt>
                      <dd className="mt-1 text-[14px] text-[#121212]">{CUSTOMER_PHONE}</dd>
                    </div>
                  </dl>
                </ProfileSection>

                <ProfileSection title="Addresses" actionLabel="Add">
                  <div className="space-y-3">
                    <AddressCard isDefault />
                    <AddressCard />
                  </div>
                </ProfileSection>

                <ProfileSection title="Payment methods">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-md border border-[#dedede] bg-white px-4 py-3 text-left"
                  >
                    <CreditCardIcon className="h-5 w-5 shrink-0 text-[#707070]" aria-hidden />
                    <span className="min-w-0 flex-1 text-[14px] text-[#121212]">Store credit</span>
                    <span className="text-[14px] text-[#707070]">INR</span>
                    <span className="text-[14px] font-medium text-[#121212]">
                      {formatCheckoutPrice(100)}
                    </span>
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-[#707070]" aria-hidden />
                  </button>
                </ProfileSection>

                <ProfileSection title="Marketing preferences">
                  <MarketingToggleRow />
                </ProfileSection>

                <section className="space-y-3 py-6">
                  <button
                    type="button"
                    className="w-full rounded-md border border-[#dedede] bg-white px-4 py-3 text-[14px] font-medium text-[#121212]"
                  >
                    Sign out
                  </button>
                  <button type="button" className="text-[14px] text-[#005bd3] hover:underline">
                    Sign out of all devices
                  </button>
                </section>

                {(footerConfig?.location ?? 'checkout_form') !== 'full_width' ? (
                  <CheckoutFooterRuntimePreview
                    alignment={footerConfig?.alignment ?? 'left'}
                    device={device}
                    highlightNodeId={highlightNodeId}
                    onSelectNode={onSelectNode}
                    constrained
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isFullWidthFooter ? (
        <CheckoutFooterRuntimePreview
          alignment={footerConfig?.alignment ?? 'left'}
          device={device}
          highlightNodeId={highlightNodeId}
          onSelectNode={onSelectNode}
        />
      ) : null}
    </div>
  );
}
