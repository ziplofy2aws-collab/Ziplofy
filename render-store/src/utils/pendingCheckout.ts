import type { CreateOrderPayload } from '../contexts/storefront-order.context';

const STORAGE_KEY = 'render-store-pending-checkout';

export interface PendingCheckoutState {
  createOrderPayload: CreateOrderPayload;
  /** Cart line item ids to remove after successful order (empty for quick-buy). */
  cartEntryIds: string[];
  merchantName: string;
  itemSummaryLine: string;
  amountPaise: number;
  /** Shown on UPI screen before order exists */
  orderIdDisplay: string;
}

export function savePendingCheckout(data: PendingCheckoutState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
}

export function loadPendingCheckout(): PendingCheckoutState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingCheckoutState;
  } catch {
    return null;
  }
}

export function clearPendingCheckout(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
