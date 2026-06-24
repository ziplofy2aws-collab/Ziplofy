import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { CheckoutMainViewHandle } from '@ziplofy/create-theme/checkout/CheckoutMainView';
import { CheckoutCheckoutView } from '@ziplofy/create-theme/checkout/CheckoutCheckoutView';
import { CHECKOUT_STOREFRONT_ROOT_CLASS } from '@ziplofy/create-theme/checkout/checkout-storefront.constants';
import { useCheckoutPageAppearance } from '@/hooks/useCheckoutPageAppearance';
import { useCheckoutPlaceOrder } from '@/hooks/useCheckoutPlaceOrder';
import { useStorefrontCart } from '@/contexts/storefront-cart.context';
import { useStorefrontAuth } from '@/contexts/storefront-auth.context';

export function CheckoutPage() {
  const formRef = useRef<CheckoutMainViewHandle>(null);
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
    inputFieldsTransparent,
    addressAutocompletion,
    loading,
  } = useCheckoutPageAppearance();
  const { placeOrder, submitting } = useCheckoutPlaceOrder(storeId);
  const { user, checkAuth } = useStorefrontAuth();
  const { getAllItems, getCartByCustomerId } = useStorefrontCart();

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user?._id) return;
    void getCartByCustomerId(user._id);
  }, [getCartByCustomerId, user?._id]);

  const cartLines = getAllItems();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500">
        Loading checkout…
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`${CHECKOUT_STOREFRONT_ROOT_CLASS} flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center`}>
        <p className="text-[16px] font-medium text-[#121212]">Sign in to complete your purchase</p>
        <p className="max-w-md text-[14px] text-[#707070]">
          Checkout requires an account so we can save your delivery address and create your order.
        </p>
        <Link
          to="/auth/login"
          state={{ from: '/checkout' }}
          className="rounded-[5px] px-5 py-3 text-[14px] font-medium text-white"
          style={{ backgroundColor: theme?.buttonColor ?? theme?.accentColor ?? '#1773b0' }}
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (!loading && cartLines.length === 0) {
    return (
      <div className={`${CHECKOUT_STOREFRONT_ROOT_CLASS} flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-6 text-center`}>
        <p className="text-[16px] font-medium text-[#121212]">Your cart is empty</p>
        <Link
          to="/cart"
          className="text-[14px] font-medium hover:underline"
          style={{ color: theme?.accentColor ?? '#1773b0' }}
        >
          Return to cart
        </Link>
      </div>
    );
  }

  return (
    <div className={`${CHECKOUT_STOREFRONT_ROOT_CLASS} checkout-storefront-checkout min-h-screen bg-white`}>
      <CheckoutCheckoutView
        mode="live"
        device="desktop"
        storeId={storeId}
        storeName={storeName}
        storeUrl={storeUrl}
        headerPosition={headerPosition}
        footerConfig={footerConfig}
        orderSummaryConfig={orderSummaryConfig}
        logo={globalLogo}
        theme={theme}
        typography={typography}
        inputFieldsTransparent={inputFieldsTransparent}
        addressAutocompletion={addressAutocompletion}
        mainFormRef={formRef}
        submitting={submitting}
        onCompleteOrder={() => void placeOrder(formRef.current)}
      />
    </div>
  );
}
