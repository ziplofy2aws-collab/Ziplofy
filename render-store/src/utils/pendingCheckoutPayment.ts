import type {
  CheckoutPaymentMethod,
  CheckoutPaymentMethodOption,
} from '@codiic/create-theme/checkout/checkout-form.types';
import type { CompletedCheckoutOrder } from '@/utils/completedCheckoutOrder';

const STORAGE_KEY = 'render-store-pending-checkout-payment';

export type PendingCheckoutPayment = {
  completedOrder: CompletedCheckoutOrder;
  paymentMethod: Extract<CheckoutPaymentMethod, 'bank_transfer' | 'upi_id'>;
  paymentMethodLabel: string;
  paymentInstructions?: CheckoutPaymentMethodOption['instructions'];
  storeId: string;
  storeName: string;
  customerId: string;
  customerName: string;
  email: string;
};

export function savePendingCheckoutPayment(data: PendingCheckoutPayment): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
}

export function loadPendingCheckoutPayment(): PendingCheckoutPayment | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingCheckoutPayment;
    if (!parsed?.completedOrder?.orderId || !parsed.storeId || !parsed.customerId) return null;
    if (parsed.paymentMethod !== 'bank_transfer' && parsed.paymentMethod !== 'upi_id') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingCheckoutPayment(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
