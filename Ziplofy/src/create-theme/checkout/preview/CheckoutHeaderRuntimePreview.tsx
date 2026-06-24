import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { CheckoutLogoAlignment, CheckoutPaletteTheme } from '../settings/checkout-settings.types';

export type CheckoutLogoPreviewConfig = {
  image?: string | null;
  alignment?: CheckoutLogoAlignment;
  width?: number;
  accentColor?: string;
};

export type CheckoutThemePreviewConfig = CheckoutPaletteTheme;

type Props = {
  storeName?: string;
  storeUrl?: string | null;
  logo?: CheckoutLogoPreviewConfig;
  theme?: CheckoutThemePreviewConfig;
  device?: 'desktop' | 'mobile';
  highlightNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
};

function LogoContent({
  storeName,
  logo,
  onDarkBackground,
}: {
  storeName: string;
  logo?: CheckoutLogoPreviewConfig;
  onDarkBackground: boolean;
}) {
  const image = logo?.image?.trim();
  const width = logo?.width ?? 50;

  if (!image) {
    return (
      <span
        className={`min-w-0 truncate text-[17px] font-semibold leading-none tracking-[-0.01em] ${
          onDarkBackground ? 'text-white' : 'text-[#121212]'
        }`}
      >
        {storeName}
      </span>
    );
  }

  return (
    <img
      src={image}
      alt={storeName}
      className="h-auto max-w-full object-contain"
      style={{ width: `${width}px` }}
    />
  );
}

export function CheckoutHeaderRuntimePreview({
  storeName = 'My Store',
  storeUrl,
  logo,
  theme,
  device = 'desktop',
  highlightNodeId = null,
  onSelectNode,
}: Props) {
  const headerHighlighted = highlightNodeId === 'checkout:header';
  const logoHighlighted = highlightNodeId === 'checkout:header:logo';
  const storefrontHref = storeUrl?.trim() || '#';
  const headerAccentColor = theme?.headerAccentColor ?? logo?.accentColor ?? '#005bd3';
  const onDarkBackground = theme?.headerBackgroundIsDark ?? false;
  const alignment = logo?.alignment ?? 'left';
  const isMobile = device === 'mobile';

  const cartIcon = (
    <span
      className="inline-flex shrink-0 items-center justify-center p-1"
      style={{ color: headerAccentColor }}
      aria-hidden
    >
      <ShoppingBagIcon className="h-6 w-6" strokeWidth={1.5} />
    </span>
  );

  const logoLink = (
    <a
      href={storefrontHref}
      className={`pointer-events-auto inline-flex shrink-0 rounded-sm ${
        logoHighlighted ? 'ring-2 ring-inset ring-[#005bd3]' : ''
      }`}
      data-checkout-node-id="checkout:header:logo"
      onClick={(e) => {
        if (onSelectNode) {
          onSelectNode('checkout:header:logo');
          e.stopPropagation();
        }
      }}
    >
      <LogoContent storeName={storeName} logo={logo} onDarkBackground={onDarkBackground} />
    </a>
  );

  return (
    <header
      className={`relative shrink-0 bg-transparent pointer-events-auto ${
        isMobile ? 'px-4 py-3.5' : 'px-6 py-4 sm:px-8'
      } ${onSelectNode ? 'cursor-pointer' : ''} ${
        headerHighlighted && !logoHighlighted ? 'ring-2 ring-inset ring-[#005bd3]' : ''
      }`}
      data-checkout-node-id="checkout:header"
      data-checkout-selectable={onSelectNode ? 'true' : undefined}
      onClick={(e) => {
        onSelectNode?.('checkout:header');
        e.stopPropagation();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectNode?.('checkout:header');
        }
      }}
      role={onSelectNode ? 'button' : undefined}
      tabIndex={onSelectNode ? 0 : undefined}
    >
      <div className="grid w-full grid-cols-3 items-center gap-3">
        <div className="flex min-w-0 items-center justify-start">
          {alignment === 'left' ? logoLink : null}
          {alignment === 'right' ? cartIcon : null}
        </div>

        <div className="flex min-w-0 items-center justify-center">
          {alignment === 'center' ? logoLink : null}
        </div>

        <div className="flex min-w-0 items-center justify-end">
          {alignment === 'right' ? logoLink : cartIcon}
        </div>
      </div>

      {storefrontHref !== '#' ? (
        <span className="sr-only">
          <a href={storefrontHref}>Cart</a>
        </span>
      ) : null}
    </header>
  );
}
