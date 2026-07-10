import type { CheckoutStorePolicyType } from './useCheckoutStorePolicies';

export type CheckoutPolicyLinkDef = {
  label: string;
  modalTitle: string;
  type: CheckoutStorePolicyType;
};

export const CHECKOUT_POLICY_LINKS: CheckoutPolicyLinkDef[] = [
  { label: 'Refund policy', modalTitle: 'Refund policy', type: 'return-refund' },
  { label: 'Shipping', modalTitle: 'Shipping', type: 'shipping' },
  { label: 'Privacy policy', modalTitle: 'Privacy policy', type: 'privacy' },
  { label: 'Terms of service', modalTitle: 'Terms of service', type: 'terms' },
  { label: 'Legal notice', modalTitle: 'Legal notice', type: 'contact' },
];
