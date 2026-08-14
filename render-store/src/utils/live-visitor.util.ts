export type LiveVisitorType = 'new' | 'returning';

const DAY_MS = 24 * 60 * 60 * 1000;

function visitorStorageKey(storeId: string): string {
  return `codiic_live_visitor:${storeId}`;
}

function visitorFirstSessionKey(storeId: string): string {
  return `codiic_live_visitor_first:${storeId}`;
}

function purchasedKey(customerId: string): string {
  return `codiic_customer_purchased:${customerId}`;
}

function createVisitorId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `vis_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Guest / anonymous: durable localStorage visitor id.
 * First browser visit ever → new; later browser sessions → returning.
 * Same continuous first visit (sessionStorage flag) stays new.
 */
export function resolveGuestVisitorType(storeId: string): LiveVisitorType {
  if (!storeId || typeof window === 'undefined') return 'new';

  const key = visitorStorageKey(storeId);
  const firstKey = visitorFirstSessionKey(storeId);

  try {
    const existing = localStorage.getItem(key);
    if (!existing) {
      localStorage.setItem(
        key,
        JSON.stringify({ id: createVisitorId(), createdAt: Date.now() }),
      );
      sessionStorage.setItem(firstKey, '1');
      return 'new';
    }
    if (sessionStorage.getItem(firstKey) === '1') return 'new';
    return 'returning';
  } catch {
    return 'new';
  }
}

export function markCustomerPurchased(customerId: string): void {
  if (!customerId || typeof window === 'undefined') return;
  try {
    localStorage.setItem(purchasedKey(customerId), '1');
    window.dispatchEvent(new CustomEvent('codiic:live-visitor-updated'));
  } catch {
    // ignore quota / private mode
  }
}

export function hasCustomerPurchasedLocally(customerId: string): boolean {
  if (!customerId || typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(purchasedKey(customerId)) === '1';
  } catch {
    return false;
  }
}

/**
 * Logged-in: prior purchase (local cache) or mature account → returning.
 * Otherwise fall back to guest cookie so returning visitors who sign in stay returning.
 * Brand-new accounts on a first visit stay new.
 */
export function resolveVisitorType(params: {
  storeId: string;
  user: { _id: string; createdAt?: string } | null;
}): LiveVisitorType {
  const guestType = resolveGuestVisitorType(params.storeId);
  const user = params.user;
  if (!user?._id) return guestType;

  if (hasCustomerPurchasedLocally(user._id)) return 'returning';

  const created = user.createdAt ? Date.parse(user.createdAt) : NaN;
  if (Number.isFinite(created) && Date.now() - created > DAY_MS) {
    return 'returning';
  }

  if (guestType === 'returning') return 'returning';
  return 'new';
}
