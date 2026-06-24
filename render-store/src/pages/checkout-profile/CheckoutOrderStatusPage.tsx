import { useEffect, useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { CheckoutOrderStatusView } from '@ziplofy/create-theme/checkout/order-status/CheckoutOrderStatusView';
import { useStorefrontAuth } from '@/contexts/storefront-auth.context';
import { useStorefrontOrder } from '@/contexts/storefront-order.context';
import { useCheckoutProfilePageAppearance } from '@/hooks/useCheckoutProfilePageAppearance';
import { mapStorefrontOrderToCheckoutStatus } from './mapStorefrontOrderToCheckoutStatus';

export function CheckoutOrderStatusPage() {
  const { orderId } = useParams<{ orderId: string }>();
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

  const order = useMemo(
    () => orders.find((entry) => entry._id === orderId) ?? null,
    [orders, orderId]
  );

  const orderIndex = useMemo(
    () => orders.findIndex((entry) => entry._id === orderId),
    [orders, orderId]
  );

  const details = useMemo(
    () => (order ? mapStorefrontOrderToCheckoutStatus(order, Math.max(orderIndex, 0)) : null),
    [order, orderIndex]
  );

  const loading = configLoading || ordersLoading;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500">
        Loading order…
      </div>
    );
  }

  if (!orderId || !order || !details) {
    return <Navigate to="/my-orders" replace />;
  }

  return (
    <CheckoutOrderStatusView
      mode="live"
      variant="storefront"
      device="desktop"
      storeId={storeId}
      storeName={storeName}
      storeUrl={storeUrl}
      headerPosition={headerPosition}
      footerConfig={footerConfig}
      logo={globalLogo}
      theme={theme}
      typography={typography}
      details={details}
      backHref="/my-orders"
    />
  );
}
