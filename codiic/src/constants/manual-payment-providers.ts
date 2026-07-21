export const MANUAL_PAYMENT_PROVIDER_KEYS = ['bank_transfer', 'upi_id', 'cod'] as const;

export type ManualPaymentProviderKey = (typeof MANUAL_PAYMENT_PROVIDER_KEYS)[number];

export const MANUAL_PAYMENT_OPTIONS: {
  key: ManualPaymentProviderKey;
  label: string;
  description: string;
  paymentMethods: string[];
}[] = [
  {
    key: 'bank_transfer',
    label: 'Bank transfer',
    description: 'Customers pay by transferring funds directly to your bank account.',
    paymentMethods: ['bank_transfer'],
  },
  {
    key: 'upi_id',
    label: 'UPI ID',
    description: 'Customers pay using your UPI ID at checkout.',
    paymentMethods: ['upi'],
  },
  {
    key: 'cod',
    label: 'Cash on delivery (COD)',
    description: 'Customers pay in cash when their order is delivered.',
    paymentMethods: ['cod'],
  },
];

export function isManualPaymentProvider(key: string): key is ManualPaymentProviderKey {
  return (MANUAL_PAYMENT_PROVIDER_KEYS as readonly string[]).includes(key);
}
