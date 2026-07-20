export type CheckoutPaymentMethod =
  | 'cod'
  | 'bank_transfer'
  | 'upi_id'
  | 'credit_card'
  | 'paypal'
  | 'other';

export type CheckoutFullNameOption = 'last_name' | 'first_last';
export type CheckoutFieldRequirementOption = 'dont_include' | 'optional' | 'required';

export type CheckoutCustomerInformation = {
  fullNameOption: CheckoutFullNameOption;
  companyNameOption: CheckoutFieldRequirementOption;
  addressLine2Option: CheckoutFieldRequirementOption;
  shippingPhoneOption: CheckoutFieldRequirementOption;
};

export const DEFAULT_CHECKOUT_CUSTOMER_INFORMATION: CheckoutCustomerInformation = {
  fullNameOption: 'last_name',
  companyNameOption: 'dont_include',
  addressLine2Option: 'optional',
  shippingPhoneOption: 'dont_include',
};

export type CheckoutPaymentMethodInstructions = {
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
};

export type CheckoutPaymentMethodOption = {
  key: CheckoutPaymentMethod;
  label: string;
  description?: string;
  instructions?: CheckoutPaymentMethodInstructions;
};

export type CheckoutAddressFields = {
  firstName: string;
  lastName: string;
  company: string;
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
  company: '',
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

export function checkoutPaymentMethodRequiresUtr(method: CheckoutPaymentMethod): boolean {
  return method === 'bank_transfer' || method === 'upi_id';
}
