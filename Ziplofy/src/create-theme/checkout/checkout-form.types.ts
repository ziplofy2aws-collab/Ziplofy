export type CheckoutPaymentMethod = 'cod' | 'credit_card' | 'paypal' | 'other';

export type CheckoutAddressFields = {
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  /** ISO 3166-1 alpha-2 (e.g. IN). */
  country: string;
};

export type CheckoutFormValues = {
  email: string;
  marketingOptIn: boolean;
  shipping: CheckoutAddressFields;
  saveInfo: boolean;
  paymentMethod: CheckoutPaymentMethod;
  billingSameAsShipping: boolean;
  billing: CheckoutAddressFields;
};

export const EMPTY_CHECKOUT_ADDRESS: CheckoutAddressFields = {
  firstName: '',
  lastName: '',
  address: '',
  apartment: '',
  city: '',
  state: 'Delhi',
  pinCode: '',
  phone: '',
  country: 'IN',
};

export type CheckoutMainViewHandle = {
  getValues: () => CheckoutFormValues;
  validate: () => boolean;
};

export function createEmptyCheckoutFormValues(): CheckoutFormValues {
  return {
    email: '',
    marketingOptIn: false,
    shipping: { ...EMPTY_CHECKOUT_ADDRESS },
    saveInfo: false,
    paymentMethod: 'cod',
    billingSameAsShipping: true,
    billing: { ...EMPTY_CHECKOUT_ADDRESS },
  };
}
