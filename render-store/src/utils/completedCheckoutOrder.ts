import type { CheckoutFormValues } from '@ziplofy/create-theme/checkout/checkout-form.types';
import {
  checkoutPaymentMethodLabel,
  formatCheckoutAddressLines,
} from '@ziplofy/create-theme/checkout/utils/checkout-order.utils';

const STORAGE_KEY = 'render-store-completed-checkout-order';

export type CompletedCheckoutOrder = {
  orderId: string;
  confirmationLabel: string;
  customerFirstName: string;
  email: string;
  paymentMethodLabel: string;
  shippingAddressLines: string[];
  total: number;
};

export function saveCompletedCheckoutOrder(data: CompletedCheckoutOrder): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
}

export function loadCompletedCheckoutOrder(): CompletedCheckoutOrder | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CompletedCheckoutOrder;
  } catch {
    return null;
  }
}

export function clearCompletedCheckoutOrder(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function buildCompletedCheckoutOrderSummary(args: {
  orderId: string;
  form: CheckoutFormValues;
  total: number;
}): CompletedCheckoutOrder {
  const { orderId, form, total } = args;
  const suffix = orderId.slice(-6).toUpperCase();
  return {
    orderId,
    confirmationLabel: `#${suffix}`,
    customerFirstName: form.shipping.firstName.trim() || 'there',
    email: form.email.trim(),
    paymentMethodLabel: checkoutPaymentMethodLabel(form.paymentMethod),
    shippingAddressLines: formatCheckoutAddressLines(form.shipping),
    total,
  };
}
