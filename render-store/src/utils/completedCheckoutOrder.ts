import type { CheckoutFormValues } from '@codiic/create-theme/checkout/checkout-form.types';
import {
  checkoutPaymentMethodLabel,
  computeCheckoutTotals,
  formatCheckoutAddressLines,
} from '@codiic/create-theme/checkout/utils/checkout-order.utils';
import type { StorefrontCartItem } from '@/contexts/storefront-cart.context';

const STORAGE_KEY = 'render-store-completed-checkout-order';

export type CompletedCheckoutOrderLine = {
  id: string;
  title: string;
  imageUrl?: string | null;
  quantity: number;
  lineTotal: number;
};

export type CompletedCheckoutOrder = {
  orderId: string;
  confirmationLabel: string;
  customerFirstName: string;
  email: string;
  paymentMethodLabel: string;
  shippingAddressLines: string[];
  billingAddressLines: string[];
  shippingMethodLabel: string;
  lines: CompletedCheckoutOrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
};

function variantOf(item: StorefrontCartItem) {
  const v = item.productVariantId;
  return typeof v === 'object' && v !== null && '_id' in v ? v : null;
}

function addressLinesWithPhone(
  address: CheckoutFormValues['shipping'],
  countryLabel = 'India'
): string[] {
  const lines = formatCheckoutAddressLines(address, countryLabel);
  const phone = address.phone.trim();
  if (phone) lines.push(phone);
  return lines;
}

function mapCartToCompletedLines(items: StorefrontCartItem[]): CompletedCheckoutOrderLine[] {
  return items.map((item) => {
    const variant = variantOf(item);
    const unitPrice = variant?.price ?? 0;
    return {
      id: item._id,
      title: variant?.sku || 'Product',
      imageUrl: variant?.images?.[0] ?? null,
      quantity: item.quantity,
      lineTotal: unitPrice * item.quantity,
    };
  });
}

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
    const parsed = JSON.parse(raw) as CompletedCheckoutOrder;
    if (!parsed?.orderId || !Array.isArray(parsed.lines)) return null;
    return parsed;
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
  cartItems: StorefrontCartItem[];
}): CompletedCheckoutOrder {
  const { orderId, form, cartItems } = args;
  const { subtotal, shipping, total } = computeCheckoutTotals(cartItems);
  const suffix = orderId.slice(-6).toUpperCase();
  const billingAddress = form.billingSameAsShipping ? form.shipping : form.billing;

  return {
    orderId,
    confirmationLabel: `#${suffix}`,
    customerFirstName: form.shipping.firstName.trim() || 'there',
    email: form.email.trim(),
    paymentMethodLabel: checkoutPaymentMethodLabel(form.paymentMethod),
    shippingAddressLines: addressLinesWithPhone(form.shipping),
    billingAddressLines: addressLinesWithPhone(billingAddress),
    shippingMethodLabel: 'Standard',
    lines: mapCartToCompletedLines(cartItems),
    subtotal,
    shipping,
    total,
  };
}
