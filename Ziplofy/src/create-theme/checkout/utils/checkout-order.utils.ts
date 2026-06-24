import type { CheckoutAddressFields, CheckoutFormValues } from '../checkout-form.types';

export const CHECKOUT_DEFAULT_SHIPPING_AMOUNT = 10;

type CartLine = {
  quantity: number;
  productVariantId: string | { _id: string; price: number };
};

function variantOf(line: CartLine) {
  const v = line.productVariantId;
  return typeof v === 'object' && v !== null && '_id' in v ? v : null;
}

export function mapCartLinesToOrderItems(lines: CartLine[]) {
  return lines
    .map((line) => {
      const variant = variantOf(line);
      if (!variant) return null;
      const price = variant.price;
      const total = price * line.quantity;
      return {
        productVariantId: variant._id,
        quantity: line.quantity,
        price,
        total,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export function computeCheckoutTotals(lines: CartLine[]) {
  let subtotal = 0;
  for (const line of lines) {
    const variant = variantOf(line);
    if (variant) subtotal += variant.price * line.quantity;
  }
  const shipping = lines.length > 0 ? CHECKOUT_DEFAULT_SHIPPING_AMOUNT : 0;
  return { subtotal, shipping, tax: 0, total: subtotal + shipping };
}

function validateAddressFields(
  address: CheckoutAddressFields,
  prefix: string,
  errors: Record<string, string>
) {
  if (!address.firstName.trim()) errors[`${prefix}.firstName`] = 'First name is required';
  if (!address.lastName.trim()) errors[`${prefix}.lastName`] = 'Last name is required';
  if (!address.address.trim()) errors[`${prefix}.address`] = 'Address is required';
  if (!address.city.trim()) errors[`${prefix}.city`] = 'City is required';
  if (!address.state.trim()) errors[`${prefix}.state`] = 'State is required';
  if (!address.pinCode.trim()) errors[`${prefix}.pinCode`] = 'PIN code is required';
  if (!address.phone.trim()) errors[`${prefix}.phone`] = 'Phone is required';
  if (!address.country.trim()) errors[`${prefix}.country`] = 'Country is required';
}

export function validateCheckoutForm(values: CheckoutFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address';
  }
  validateAddressFields(values.shipping, 'shipping', errors);
  if (!values.billingSameAsShipping) {
    validateAddressFields(values.billing, 'billing', errors);
  }
  return errors;
}

export function formatCheckoutAddressLines(address: CheckoutAddressFields, countryLabel = 'India'): string[] {
  const name = [address.firstName, address.lastName].filter(Boolean).join(' ').trim();
  const street = [address.address, address.apartment].filter(Boolean).join(', ');
  const locality = [address.city, address.state, address.pinCode].filter(Boolean).join(' ');
  return [name, street, locality, countryLabel].filter((line) => line.length > 0);
}

export function checkoutPaymentMethodLabel(method: CheckoutFormValues['paymentMethod']): string {
  if (method === 'cod') return 'Cash on Delivery (COD)';
  if (method === 'credit_card') return 'Credit card';
  if (method === 'paypal') return 'PayPal';
  return 'Other';
}
