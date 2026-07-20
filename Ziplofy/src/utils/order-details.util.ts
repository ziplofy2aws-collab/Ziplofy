import type { AdminOrder, AdminOrderAddressRef } from '../contexts/admin-order.context';

export function formatOrderCurrency(amount: number): string {
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatOrderDisplayId(orderId: string): string {
  if (!orderId) return '—';
  return `#${orderId.slice(-4).toUpperCase()}`;
}

export function formatOrderHeaderDate(dateString?: string): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const formatted = date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${formatted} from Online Store`;
}

export function formatPaymentMethodLabel(method?: string): string {
  if (!method) return '—';
  const map: Record<string, string> = {
    credit_card: 'Credit Card',
    paypal: 'PayPal',
    cod: 'Cash on Delivery (COD)',
    bank_transfer: 'Bank transfer',
    upi_id: 'UPI ID',
    other: 'Other',
  };
  return map[method] || method;
}

export function getCustomerDisplayName(customer?: {
  firstName?: string;
  lastName?: string;
  email?: string;
}): string {
  if (!customer) return '—';
  return [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim() || customer.email || '—';
}

export function getAddressDisplayName(addr?: AdminOrderAddressRef): string {
  if (!addr) return '—';
  return [addr.firstName, addr.lastName].filter(Boolean).join(' ').trim() || '—';
}

export function isOrderFulfilled(status: AdminOrder['status']): boolean {
  return status === 'shipped' || status === 'delivered';
}

export function getFulfillmentLabel(status: AdminOrder['status']): string {
  if (status === 'cancelled') return 'Cancelled';
  if (isOrderFulfilled(status)) return 'Fulfilled';
  return 'Unfulfilled';
}

export function getPaymentStatusLabel(paymentStatus: AdminOrder['paymentStatus']): string {
  if (paymentStatus === 'paid') return 'Paid';
  if (paymentStatus === 'refunded') return 'Refunded';
  return 'Payment pending';
}

export function addressesAreSame(
  shipping?: AdminOrderAddressRef,
  billing?: AdminOrderAddressRef
): boolean {
  if (!billing?._id || !shipping?._id) return true;
  return billing._id === shipping._id;
}

export function formatAddressLines(addr?: AdminOrderAddressRef): string[] {
  if (!addr) return [];
  const lines: string[] = [];
  const name = getAddressDisplayName(addr);
  if (name !== '—') lines.push(name);
  if (addr.address) lines.push(addr.address);
  if (addr.apartment) lines.push(addr.apartment);
  const cityLine = [addr.city, addr.state, addr.pinCode].filter(Boolean).join(' ');
  if (cityLine) lines.push(cityLine);
  if (addr.country) lines.push(addr.country);
  if (addr.phoneNumber) lines.push(addr.phoneNumber);
  return lines;
}

export const orderCardClass = 'overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm';
