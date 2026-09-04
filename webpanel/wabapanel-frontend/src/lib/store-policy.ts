import api from '@/lib/api';

export type StorePolicyType = 'return-refund' | 'privacy' | 'terms' | 'contact';

export type StorePolicyRecord = {
  _id: string;
  storeId: string;
  policyType: StorePolicyType;
  content: string;
  createdAt?: string;
  updatedAt?: string;
};

export type StorePoliciesMap = Record<StorePolicyType, StorePolicyRecord | null>;

export const STORE_POLICY_TYPES: StorePolicyType[] = [
  'return-refund',
  'privacy',
  'terms',
  'contact',
];

export const STORE_POLICY_LABELS: Record<StorePolicyType, string> = {
  'return-refund': 'Return and refund policy',
  privacy: 'Privacy policy',
  terms: 'Terms of service',
  contact: 'Contact information',
};

export const storePolicyApi = {
  listPolicies: (storeId: string) =>
    api.get<{ success: boolean; data: StorePoliciesMap; count?: number }>(`/stores/${storeId}/policies`),

  getPolicy: (storeId: string, policyType: StorePolicyType) =>
    api.get<{ success: boolean; data: StorePolicyRecord | null; message?: string }>(
      `/stores/${storeId}/policies/${policyType}`
    ),

  upsertPolicy: (storeId: string, policyType: StorePolicyType, content: string) =>
    api.put<{ success: boolean; data: StorePolicyRecord; message?: string }>(
      `/stores/${storeId}/policies/${policyType}`,
      { content }
    ),
};
