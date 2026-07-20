import React from 'react';
import type { CheckoutFooterConfig, CheckoutHeaderPosition, CheckoutPaletteTheme } from '../settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import { CheckoutOrdersView } from '../orders/CheckoutOrdersView';
import type { CheckoutLogoPreviewConfig } from './CheckoutHeaderRuntimePreview';

type Props = {
  device?: 'desktop' | 'mobile';
  storeId?: string | null;
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

export function CheckoutOrdersRuntimePreview(props: Props) {
  return <CheckoutOrdersView mode="preview" variant="preview" {...props} />;
}
