import type { AdminOrderAddressRef } from '../../contexts/admin-order.context';

export function formatCustomerLocation(address?: AdminOrderAddressRef | null): string {
  if (!address) return '';

  const cityState = [address.city, address.state].filter(Boolean).join(' ').trim();
  const parts = [cityState, address.country].filter(Boolean);
  return parts.join(', ');
}
