import React, { useEffect, useMemo } from 'react';
import { CheckoutOrdersView } from '@ziplofy/create-theme/checkout/orders/CheckoutOrdersView';
import { useStorefrontAuth } from '@/contexts/storefront-auth.context';
import { useStorefrontOrder } from '@/contexts/storefront-order.context';
import { useCheckoutProfilePageAppearance } from '@/hooks/useCheckoutProfilePageAppearance';
import { mapStorefrontOrdersToCheckoutCards } from './mapStorefrontOrdersToCheckoutCards';

export function CheckoutOrdersPage() {
  const { user } = useStorefrontAuth();
  const { orders, getOrdersByCustomerId, loading: ordersLoading } = useStorefrontOrder();
  const {
    storeId,
    storeName,
    storeUrl,
    theme,
    typography,
    globalLogo,
    headerPosition,
    footerConfig,
    loading: configLoading,
  } = useCheckoutProfilePageAppearance();

  useEffect(() => {
    if (!user?._id) return;
    void getOrdersByCustomerId(user._id);
  }, [getOrdersByCustomerId, user?._id]);

  const orderCards = useMemo(() => mapStorefrontOrdersToCheckoutCards(orders), [orders]);

  return (
    <CheckoutOrdersView
      mode="live"
      variant="storefront"
      storeId={storeId}
      storeName={storeName}
      storeUrl={storeUrl}
      headerPosition={headerPosition}
      footerConfig={footerConfig}
      logo={globalLogo}
      theme={theme}
      typography={typography}
      orders={orderCards}
      loading={configLoading || ordersLoading}
      profileHref="/profile"
    />
  );
}
