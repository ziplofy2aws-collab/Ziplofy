import React from 'react';
import type { CheckoutFooterConfig, CheckoutHeaderPosition, CheckoutPaletteTheme } from '../settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import { CheckoutProfileView } from '../profile/CheckoutProfileView';
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

export function CheckoutAccountProfileRuntimePreview(props: Props) {
  return <CheckoutProfileView mode="preview" variant="preview" {...props} />;
}
