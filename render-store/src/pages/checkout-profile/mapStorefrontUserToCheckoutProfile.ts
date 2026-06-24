import type { CustomerAddress } from '@/contexts/customer-address-storefront.context';
import type { StorefrontUser } from '@/contexts/storefront-auth.context';
import type {
  CheckoutProfileAddress,
  CheckoutProfileViewData,
} from '@ziplofy/create-theme/checkout/profile/checkout-profile.types';

function countryName(countryId: CustomerAddress['countryId']): string {
  if (typeof countryId === 'object' && countryId?.name) return countryId.name;
  return '';
}

export function mapCustomerAddressToCheckoutProfile(
  address: CustomerAddress,
  defaultAddressId?: string | null
): CheckoutProfileAddress {
  const name = `${address.firstName} ${address.lastName}`.trim();
  const street = [address.address, address.apartment].filter(Boolean).join(', ');
  const cityLine = [address.pinCode, address.city, address.state].filter(Boolean).join(' ');
  const country = countryName(address.countryId);

  return {
    id: address._id,
    name,
    lines: [street, cityLine, country].filter(Boolean),
    isDefault: Boolean(defaultAddressId && defaultAddressId === address._id),
  };
}

export function mapStorefrontUserToCheckoutProfile(
  user: StorefrontUser,
  addresses: CustomerAddress[]
): CheckoutProfileViewData {
  return {
    customerName: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    phone: user.phoneNumber?.trim() || '',
    addresses: addresses.map((address) =>
      mapCustomerAddressToCheckoutProfile(address, user.defaultAddress)
    ),
    storeCredit: 100,
    marketingEmailOptIn: user.agreedToMarketingEmails,
  };
}
