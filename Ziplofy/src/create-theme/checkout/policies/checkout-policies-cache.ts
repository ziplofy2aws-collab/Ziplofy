import { checkoutHttp } from '../api/checkout-http';
import type {
  CheckoutStorePolicyContent,
  CheckoutStorePolicyType,
  CheckoutStoreWrittenPolicies,
} from './useCheckoutStorePolicies';

const cache = new Map<string, CheckoutStoreWrittenPolicies>();
const inflightAll = new Map<string, Promise<CheckoutStoreWrittenPolicies | null>>();
const inflightByType = new Map<string, Promise<CheckoutStorePolicyContent | null>>();

const POLICY_KEY: Record<CheckoutStorePolicyType, keyof CheckoutStoreWrittenPolicies> = {
  'return-refund': 'returnRefund',
  privacy: 'privacy',
  terms: 'terms',
  shipping: 'shipping',
  contact: 'contact',
};

const emptyPolicies = (): CheckoutStoreWrittenPolicies => ({
  returnRefund: null,
  privacy: null,
  terms: null,
  shipping: null,
  contact: null,
});

function mergePolicyIntoCache(
  storeId: string,
  type: CheckoutStorePolicyType,
  policy: CheckoutStorePolicyContent | null
): CheckoutStoreWrittenPolicies {
  const existing = cache.get(storeId) ?? emptyPolicies();
  const next = { ...existing, [POLICY_KEY[type]]: policy };
  cache.set(storeId, next);
  return next;
}

export function peekCheckoutWrittenPolicies(storeId: string): CheckoutStoreWrittenPolicies | null {
  return cache.get(storeId) ?? null;
}

export async function fetchCheckoutWrittenPolicies(
  storeId: string
): Promise<CheckoutStoreWrittenPolicies | null> {
  const cached = cache.get(storeId);
  if (cached) return cached;

  const existing = inflightAll.get(storeId);
  if (existing) return existing;

  const promise = checkoutHttp
    .get<{ success: boolean; data: CheckoutStoreWrittenPolicies; message?: string }>(
      `/storefront/policies/store/${storeId}`
    )
    .then((res) => {
      if (!res.data?.success || !res.data.data) {
        throw new Error(res.data?.message || 'Failed to load policies');
      }
      cache.set(storeId, res.data.data);
      return res.data.data;
    })
    .finally(() => {
      inflightAll.delete(storeId);
    });

  inflightAll.set(storeId, promise);
  return promise;
}

export async function fetchCheckoutPolicyByType(
  storeId: string,
  type: CheckoutStorePolicyType
): Promise<CheckoutStorePolicyContent | null> {
  const cacheKey = `${storeId}:${type}`;
  const existing = inflightByType.get(cacheKey);
  if (existing) return existing;

  const promise = checkoutHttp
    .get<{ success: boolean; data: CheckoutStorePolicyContent | null; message?: string }>(
      `/storefront/policies/store/${storeId}/type/${type}`
    )
    .then((res) => {
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Failed to load policy');
      }
      mergePolicyIntoCache(storeId, type, res.data.data);
      return res.data.data;
    })
    .finally(() => {
      inflightByType.delete(cacheKey);
    });

  inflightByType.set(cacheKey, promise);
  return promise;
}

export function clearCheckoutWrittenPoliciesCache(storeId?: string): void {
  if (storeId) {
    cache.delete(storeId);
    inflightAll.delete(storeId);
    for (const key of inflightByType.keys()) {
      if (key.startsWith(`${storeId}:`)) {
        inflightByType.delete(key);
      }
    }
    return;
  }
  cache.clear();
  inflightAll.clear();
  inflightByType.clear();
}
