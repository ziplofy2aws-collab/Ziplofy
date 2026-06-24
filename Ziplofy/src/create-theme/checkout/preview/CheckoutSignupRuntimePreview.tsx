import React from 'react';
import { CheckoutSignupView } from '../auth/CheckoutSignupView';
import { CheckoutPolicyModal } from '../policies/CheckoutPolicyModal';
import { useCheckoutPolicyModal } from '../policies/useCheckoutPolicyModal';
import type { CheckoutSignInMainConfig } from '../settings/checkout-settings.types';
import type { CheckoutPaletteTheme } from '../settings/checkout-settings.types';
import type { CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';
import type { CheckoutLogoPreviewConfig } from './CheckoutHeaderRuntimePreview';

type Props = {
  storeId?: string | null;
  storeName?: string;
  logo?: CheckoutLogoPreviewConfig;
  typography?: CheckoutTypographyTheme;
  theme?: CheckoutPaletteTheme;
  mainConfig?: CheckoutSignInMainConfig;
  device?: 'desktop' | 'mobile';
};

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

  return (
    <CheckoutSignupView
      mode="preview"
      storeId={storeId}
      storeName={storeName}
      logo={logo}
      typography={typography}
      theme={theme}
      mainConfig={mainConfig}
      device={device}
      variant="preview"
      onOpenPolicy={openPolicy}
      policyModal={
        <CheckoutPolicyModal
          open={open}
          title={activeTitle}
          loading={loading && !content}
          error={error}
          content={content}
          onClose={closePolicy}
        />
      }
    />
  );
}
