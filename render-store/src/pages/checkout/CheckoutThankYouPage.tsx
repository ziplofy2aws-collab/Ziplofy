import React from 'react';
import { Navigate } from 'react-router-dom';
import { CheckoutThankYouView } from '@ziplofy/create-theme/checkout/CheckoutThankYouView';
import { CHECKOUT_STOREFRONT_ROOT_CLASS } from '@ziplofy/create-theme/checkout/checkout-storefront.constants';
import { useCheckoutThankYouPageAppearance } from '@/hooks/useCheckoutThankYouPageAppearance';
import { loadCompletedCheckoutOrder } from '@/utils/completedCheckoutOrder';

export function CheckoutThankYouPage() {
  const {
    storeId,
    storeName,
    storeUrl,
    theme,
    typography,
    globalLogo,
    headerPosition,
    footerConfig,
    orderSummaryConfig,
    thankYouMain,
    loading,
  } = useCheckoutThankYouPageAppearance();

  const completedOrder = loadCompletedCheckoutOrder();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  if (!completedOrder) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={`${CHECKOUT_STOREFRONT_ROOT_CLASS} checkout-storefront-thank-you flex min-h-screen flex-col bg-white`}>
      <CheckoutThankYouView
        device="desktop"
        storeId={storeId}
        storeName={storeName}
        storeUrl={storeUrl}
        headerPosition={headerPosition}
        mainConfig={thankYouMain}
        footerConfig={footerConfig}
        orderSummaryConfig={orderSummaryConfig}
        logo={globalLogo}
        theme={theme}
        typography={typography}
        order={completedOrder}
      />
    </div>
  );
}
