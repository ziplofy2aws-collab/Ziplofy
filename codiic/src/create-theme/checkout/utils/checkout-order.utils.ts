import type {
  CheckoutAddressFields,
  CheckoutCustomerInformation,
  CheckoutFormValues,
} from '../checkout-form.types';
import { DEFAULT_CHECKOUT_CUSTOMER_INFORMATION } from '../checkout-form.types';

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

function isFieldRequired(option: CheckoutCustomerInformation['companyNameOption']) {
  return option === 'required';
}

function isFieldIncluded(option: CheckoutCustomerInformation['companyNameOption']) {
  return option !== 'dont_include';
}

function validateAddressFields(
  address: CheckoutAddressFields,
  prefix: string,
  errors: Record<string, string>,
  customerInformation: CheckoutCustomerInformation,
  options?: { applyShippingPhoneSetting?: boolean }
) {
  const applyShippingPhoneSetting = options?.applyShippingPhoneSetting ?? false;
  const phoneOption = applyShippingPhoneSetting
    ? customerInformation.shippingPhoneOption
    : 'optional';

  if (customerInformation.fullNameOption === 'first_last') {
    if (!address.firstName.trim()) errors[`${prefix}.firstName`] = 'First name is required';
    if (!address.lastName.trim()) errors[`${prefix}.lastName`] = 'Last name is required';
  } else if (!address.lastName.trim()) {
    errors[`${prefix}.lastName`] = 'Last name is required';
  }

  if (
    isFieldIncluded(customerInformation.companyNameOption) &&
    isFieldRequired(customerInformation.companyNameOption) &&
    !address.company.trim()
  ) {
    errors[`${prefix}.company`] = 'Company name is required';
  }

  if (!address.address.trim()) errors[`${prefix}.address`] = 'Address is required';

  if (
    isFieldIncluded(customerInformation.addressLine2Option) &&
    isFieldRequired(customerInformation.addressLine2Option) &&
    !address.apartment.trim()
  ) {
    errors[`${prefix}.apartment`] = 'Apartment, suite, etc. is required';
  }

  if (!address.city.trim()) errors[`${prefix}.city`] = 'City is required';
  if (!address.state.trim()) errors[`${prefix}.state`] = 'State is required';
  if (!address.pinCode.trim()) errors[`${prefix}.pinCode`] = 'PIN code is required';

  if (isFieldIncluded(phoneOption) && isFieldRequired(phoneOption) && !address.phone.trim()) {
    errors[`${prefix}.phone`] = 'Phone is required';
  }

  if (!address.country.trim()) errors[`${prefix}.country`] = 'Country is required';
}

export function validateCheckoutForm(
  values: CheckoutFormValues,
  customerInformation: CheckoutCustomerInformation = DEFAULT_CHECKOUT_CUSTOMER_INFORMATION
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address';
  }
  validateAddressFields(values.shipping, 'shipping', errors, customerInformation, {
    applyShippingPhoneSetting: true,
  });
  if (!values.billingSameAsShipping) {
    validateAddressFields(values.billing, 'billing', errors, customerInformation);
  }
  return errors;
}

export function normalizeCheckoutAddressForApi(
  address: CheckoutAddressFields,
  customerInformation: CheckoutCustomerInformation,
  options?: { applyShippingPhoneSetting?: boolean; fallbackPhone?: string }
) {
  const applyShippingPhoneSetting = options?.applyShippingPhoneSetting ?? false;
  const phoneOption = applyShippingPhoneSetting
    ? customerInformation.shippingPhoneOption
    : 'optional';

  const firstName =
    customerInformation.fullNameOption === 'first_last'
      ? address.firstName.trim()
      : address.firstName.trim() || '.';

  const phone =
    isFieldIncluded(phoneOption) && address.phone.trim()
      ? address.phone.trim()
      : options?.fallbackPhone?.trim() || address.phone.trim() || 'N/A';

  return {
    firstName,
    lastName: address.lastName.trim(),
    company: address.company.trim() || undefined,
    address: address.address.trim(),
    apartment: address.apartment.trim() || undefined,
    city: address.city.trim(),
    state: address.state.trim(),
    pinCode: address.pinCode.trim(),
    phoneNumber: phone,
  };
}

export function formatCheckoutAddressLines(address: CheckoutAddressFields, countryLabel = 'India'): string[] {
  const name =
    address.firstName.trim() && address.firstName.trim() !== '.'
      ? [address.firstName, address.lastName].filter(Boolean).join(' ').trim()
      : address.lastName.trim();
  const street = [address.address, address.apartment].filter(Boolean).join(', ');
  const locality = [address.city, address.state, address.pinCode].filter(Boolean).join(' ');
  return [name, address.company, street, locality, countryLabel].filter(
    (line): line is string => Boolean(line && line.length > 0)
  );
}

export function checkoutPaymentMethodLabel(method: CheckoutFormValues['paymentMethod']): string {
  if (method === 'cod') return 'Cash on Delivery (COD)';
  if (method === 'bank_transfer') return 'Bank transfer';
  if (method === 'upi_id') return 'UPI';
  if (method === 'credit_card') return 'Credit card';
  if (method === 'paypal') return 'PayPal';
  return 'Other';
}
