import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { CheckoutMainViewHandle, CheckoutPaymentMethodOption } from '@codiic/create-theme/checkout/checkout-form.types';
import { checkoutPaymentMethodRequiresUtr } from '@codiic/create-theme/checkout/checkout-form.types';
import { useCustomerAddresses } from '@/contexts/customer-address-storefront.context';
import { useStorefrontAuth } from '@/contexts/storefront-auth.context';
import { useStorefrontCart } from '@/contexts/storefront-cart.context';
import { useStorefrontOrder } from '@/contexts/storefront-order.context';
import {
  buildCompletedCheckoutOrderSummary,
  saveCompletedCheckoutOrder,
} from '@/utils/completedCheckoutOrder';
import { savePendingCheckoutPayment } from '@/utils/pendingCheckoutPayment';
import {
  computeCheckoutTotals,
  mapCartLinesToOrderItems,
  normalizeCheckoutAddressForApi,
  checkoutPaymentMethodLabel,
} from '@codiic/create-theme/checkout/utils/checkout-order.utils';
import { useStorefrontCheckoutCustomerInformation } from '@/contexts/storefront-checkout-customer-information.context';

export function useCheckoutPlaceOrder(storeId: string | null, storeName?: string | null) {
  const navigate = useNavigate();
  const { user } = useStorefrontAuth();
  const { createOrder } = useStorefrontOrder();
  const { addCustomerAddress } = useCustomerAddresses();
  const { customerInformation } = useStorefrontCheckoutCustomerInformation();
  const { getCartByCustomerId, deleteCartEntry } = useStorefrontCart();
  const [submitting, setSubmitting] = useState(false);

  const placeOrder = useCallback(
    async (
      formRef: CheckoutMainViewHandle | null,
      selectedPaymentMethod?: CheckoutPaymentMethodOption
    ) => {
      if (!storeId || !user) {
        toast.error('Please sign in to complete your order');
        navigate('/auth/login', { state: { from: '/checkout' } });
        return;
      }

      if (!formRef?.validate()) {
        toast.error('Please fill in all required fields');
        return;
      }

      const form = formRef.getValues();
      setSubmitting(true);

      try {
        const cartItems = await getCartByCustomerId(user._id);
        if (cartItems.length === 0) {
          toast.error('Your cart is empty');
          navigate('/cart');
          return;
        }

        const orderItems = mapCartLinesToOrderItems(cartItems);
        if (orderItems.length === 0) {
          toast.error('Unable to place order — cart items are invalid');
          return;
        }

        const { subtotal, shipping, tax, total } = computeCheckoutTotals(cartItems);

        const shippingAddressPayload = normalizeCheckoutAddressForApi(
          form.shipping,
          customerInformation,
          { applyShippingPhoneSetting: true, fallbackPhone: user.phoneNumber }
        );

        const shippingAddress = await addCustomerAddress({
          customerId: user._id,
          country: form.shipping.country,
          ...shippingAddressPayload,
          addressType: 'shipping',
        });

        let billingAddressId: string | undefined;
        if (!form.billingSameAsShipping) {
          const billingAddressPayload = normalizeCheckoutAddressForApi(
            form.billing,
            customerInformation,
            { fallbackPhone: user.phoneNumber }
          );
          const billingAddress = await addCustomerAddress({
            customerId: user._id,
            country: form.billing.country,
            ...billingAddressPayload,
            addressType: 'billing',
          });
          billingAddressId = billingAddress._id;
        }

        const order = await createOrder({
          storeId,
          shippingAddressId: shippingAddress._id,
          billingAddressId,
          items: orderItems,
          paymentMethod: form.paymentMethod,
          subtotal,
          tax,
          shippingCost: shipping,
          total,
        });

        for (const item of cartItems) {
          try {
            await deleteCartEntry(item._id);
          } catch {
            /* continue clearing remaining lines */
          }
        }

        const completedOrder = buildCompletedCheckoutOrderSummary({
          orderId: order._id,
          form,
          cartItems,
        });

        const customerName = [form.shipping.firstName, form.shipping.lastName]
          .filter(Boolean)
          .join(' ')
          .trim();

        if (checkoutPaymentMethodRequiresUtr(form.paymentMethod)) {
          savePendingCheckoutPayment({
            completedOrder,
            paymentMethod: form.paymentMethod as 'bank_transfer' | 'upi_id',
            paymentMethodLabel: selectedPaymentMethod?.label ?? checkoutPaymentMethodLabel(form.paymentMethod),
            paymentInstructions: selectedPaymentMethod?.instructions,
            storeId,
            storeName: storeName ?? 'My Store',
            customerId: user._id,
            customerName: customerName || 'Customer',
            email: form.email.trim(),
          });
          navigate('/checkout/payment-confirmation', { replace: true });
          return;
        }

        saveCompletedCheckoutOrder(completedOrder);
        navigate('/checkout/thank-you', { replace: true });
      } catch {
        /* errors surfaced via context toasts / thrown messages */
      } finally {
        setSubmitting(false);
      }
    },
    [
      storeId,
      user,
      navigate,
      getCartByCustomerId,
      addCustomerAddress,
      createOrder,
      deleteCartEntry,
      customerInformation,
      storeName,
    ]
  );

  return { placeOrder, submitting };
}
