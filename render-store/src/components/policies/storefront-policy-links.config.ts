import type { StorefrontPolicyType } from '@/contexts/storefront-policies.context';

export type StorefrontPolicyLinkDef = {
  label: string;
  modalTitle: string;
  type: StorefrontPolicyType;
};

export const STOREFRONT_POLICY_LINKS: StorefrontPolicyLinkDef[] = [
  { label: 'Refund policy', modalTitle: 'Refund policy', type: 'return-refund' },
  { label: 'Shipping', modalTitle: 'Shipping', type: 'shipping' },
  { label: 'Privacy policy', modalTitle: 'Privacy policy', type: 'privacy' },
  { label: 'Terms of service', modalTitle: 'Terms of service', type: 'terms' },
  { label: 'Legal notice', modalTitle: 'Legal notice', type: 'contact' },
];
