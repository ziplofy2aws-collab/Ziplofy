import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { CheckoutMainViewHandle } from '@codiic/create-theme/checkout/checkout-form.types';
import { useCustomerAddresses } from '@/contexts/customer-address-storefront.context';
import { useStorefrontAuth } from '@/contexts/storefront-auth.context';
import { useStorefrontCart } from '@/contexts/storefront-cart.context';
import { useStorefrontOrder } from '@/contexts/storefront-order.context';
import {
  buildCompletedCheckoutOrderSummary,
  saveCompletedCheckoutOrder,
} from '@/utils/completedCheckoutOrder';
import {
  computeCheckoutTotals,
  mapCartLinesToOrderItems,
} from '@codiic/create-theme/checkout/utils/checkout-order.utils';

export function useCheckoutPlaceOrder(storeId: string | null) {
  const navigate = useNavigate();
  const { user } = useStorefrontAuth();
  const { createOrder } = useStorefrontOrder();
  const { addCustomerAddress } = useCustomerAddresses();
  const { getCartByCustomerId, deleteCartEntry } = useStorefrontCart();
  const [submitting, setSubmitting] = useState(false);

  const placeOrder = useCallback(
    async (formRef: CheckoutMainViewHandle | null) => {
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

        const shippingAddress = await addCustomerAddress({
          customerId: user._id,
          country: form.shipping.country,
          firstName: form.shipping.firstName.trim(),
          lastName: form.shipping.lastName.trim(),
          address: form.shipping.address.trim(),
          apartment: form.shipping.apartment.trim() || undefined,
          city: form.shipping.city.trim(),
          state: form.shipping.state.trim(),
          pinCode: form.shipping.pinCode.trim(),
          phoneNumber: form.shipping.phone.trim(),
          addressType: 'shipping',
        });

        let billingAddressId: string | undefined;
        if (!form.billingSameAsShipping) {
          const billingAddress = await addCustomerAddress({
            customerId: user._id,
            country: form.billing.country,
            firstName: form.billing.firstName.trim(),
            lastName: form.billing.lastName.trim(),
            address: form.billing.address.trim(),
            apartment: form.billing.apartment.trim() || undefined,
            city: form.billing.city.trim(),
            state: form.billing.state.trim(),
            pinCode: form.billing.pinCode.trim(),
            phoneNumber: form.billing.phone.trim(),
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

        saveCompletedCheckoutOrder(
          buildCompletedCheckoutOrderSummary({
            orderId: order._id,
            form,
            cartItems,
          })
        );

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
    ]
  );

  return { placeOrder, submitting };
}
