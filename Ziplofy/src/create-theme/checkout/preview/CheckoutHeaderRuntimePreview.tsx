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
      className="h-auto max-h-16 object-contain"
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
    <a href={storefrontHref} className="pointer-events-auto shrink-0" onClick={(e) => e.stopPropagation()}>
      <LogoContent storeName={storeName} logo={logo} onDarkBackground={onDarkBackground} />
    </a>
  );

  return (
    <header
      className={`relative flex shrink-0 items-center bg-transparent pointer-events-auto ${
        isMobile ? 'px-4 py-3.5' : 'px-6 py-4 sm:px-8'
      } ${onSelectNode ? 'cursor-pointer' : ''} ${headerHighlighted ? 'ring-2 ring-inset ring-[#005bd3]' : ''}`}
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
      {alignment === 'left' ? logoLink : <span className="w-6 shrink-0" aria-hidden />}

      {alignment === 'center' ? (
        <div className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {logoLink}
        </div>
      ) : null}

      {alignment === 'right' ? (
        <div className="ml-auto flex items-center gap-4">
          {logoLink}
          {cartIcon}
        </div>
      ) : (
        <div className="ml-auto flex items-center">{cartIcon}</div>
      )}

      {storefrontHref !== '#' ? (
        <span className="sr-only">
          <a href={storefrontHref}>Cart</a>
        </span>
      ) : null}
    </header>
  );
}
