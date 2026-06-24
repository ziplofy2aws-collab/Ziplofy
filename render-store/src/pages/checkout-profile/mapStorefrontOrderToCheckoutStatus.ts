import type { StorefrontOrder } from '@/contexts/storefront-order.context';
import type { CheckoutOrderStatusDetails } from '@ziplofy/create-theme/checkout/order-status/checkout-order-status.types';
import { CHECKOUT_ORDER_STATUS_GRADIENTS } from '@ziplofy/create-theme/checkout/order-status/checkout-order-status.types';
import { checkoutPaymentMethodLabel } from '@ziplofy/create-theme/checkout/utils/checkout-order.utils';
import { formatCheckoutPrice } from '@ziplofy/create-theme/checkout/utils/format-checkout-price';

type OrderShippingAddress = {
  firstName?: string;
  lastName?: string;
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  phoneNumber?: string;
  countryId?: string | { _id?: string; name?: string; iso2?: string };
};

type OrderCustomer = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
};

function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatLongDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
}

function formatOrderDisplayId(order: StorefrontOrder, index = 0): string {
  const suffix = order._id.slice(-4);
  if (/^\d+$/.test(suffix)) return suffix;
  return String(1001 + index);
}

function countryNameFromAddress(address: OrderShippingAddress): string {
  const countryId = address.countryId;
  if (typeof countryId === 'object' && countryId?.name) return countryId.name;
  return '';
}

function formatShippingAddressLines(address?: OrderShippingAddress | null): string[] {
  if (!address || typeof address !== 'object') return [];

  const name = [address.firstName, address.lastName].filter(Boolean).join(' ');
  const street = [address.address, address.apartment].filter(Boolean).join(', ');
  const locality = [address.city, address.state, address.pinCode].filter(Boolean).join(' ');
  const country = countryNameFromAddress(address);

  return [name, street, locality, country, address.phoneNumber].filter(
    (line): line is string => typeof line === 'string' && line.length > 0
  );
}

function resolveCustomer(order: StorefrontOrder): OrderCustomer | null {
  const customer = order.customerId;
  if (!customer || typeof customer !== 'object') return null;
  return customer;
}

function resolveShippingAddress(order: StorefrontOrder): OrderShippingAddress | null {
  const address = order.shippingAddressId;
  if (!address || typeof address !== 'object') return null;
  return address as OrderShippingAddress;
}

function lineFulfillmentStatus(order: StorefrontOrder): 'delivered' | 'confirmed' | 'shipped' {
  if (order.status === 'delivered') return 'delivered';
  if (order.status === 'shipped') return 'shipped';
  return 'confirmed';
}

function lineHeadline(status: 'delivered' | 'confirmed' | 'shipped', date: string): string | null {
  if (status === 'delivered') return `Delivered ${date}`;
  if (status === 'shipped') return `On its way`;
  return null;
}

function paymentMethodLabel(order: StorefrontOrder): string {
  if (order.paymentMethod === 'credit_card') return 'Visa · 4242';
  return checkoutPaymentMethodLabel(order.paymentMethod ?? 'cod');
}

export function mapStorefrontOrderToCheckoutStatus(
  order: StorefrontOrder,
  index = 0
): CheckoutOrderStatusDetails {
  const orderNumber = formatOrderDisplayId(order, index);
  const confirmedDate = formatShortDate(order.orderDate || order.createdAt);
  const dueDate = formatShortDate(order.orderDate || order.createdAt);
  const dueDateLong = formatLongDate(order.orderDate || order.createdAt);
  const statusDate = formatShortDate(order.updatedAt || order.createdAt);
  const fulfillmentStatus = lineFulfillmentStatus(order);
  const amountDue = order.paymentStatus === 'unpaid' ? order.total : 0;
  const amountPaid = order.paymentStatus === 'paid' ? order.total : 0;
  const shipping = order.shippingCost ?? 0;

  const lineItems = (order.items ?? []).map((item, itemIndex) => {
    const variant =
      typeof item.productVariantId === 'object' && item.productVariantId !== null
        ? item.productVariantId
        : null;

    return {
      id: item._id,
      title: variant?.sku || 'Product',
      variant: 'Default Title',
      price: item.price,
      quantity: item.quantity,
      imageUrl: variant?.images?.[0] ?? null,
      imageGradient:
        CHECKOUT_ORDER_STATUS_GRADIENTS[itemIndex % CHECKOUT_ORDER_STATUS_GRADIENTS.length],
      fulfillmentStatus,
      statusDate,
      headline: lineHeadline(fulfillmentStatus, statusDate),
    };
  });

  const paymentDetailLine =
    amountPaid > 0
      ? `${formatCheckoutPrice(amountPaid)} INR · ${formatShortDate(order.updatedAt || order.createdAt)}`
      : null;

  const customer = resolveCustomer(order);
  const shippingAddress = resolveShippingAddress(order);

  return {
    orderNumber,
    confirmedDate,
    dueDate,
    dueDateLong,
    amountDue,
    amountPaid,
    subtotal: order.subtotal,
    shippingLabel: shipping <= 0 ? 'Free' : formatCheckoutPrice(shipping),
    total: order.total,
    showPaymentCard: amountDue > 0,
    lineItems,
    customerName: customer
      ? [customer.firstName, customer.lastName].filter(Boolean).join(' ')
      : '',
    customerEmail: customer?.email ?? '',
    customerPhone: shippingAddress?.phoneNumber ?? customer?.phoneNumber ?? '',
    shippingAddressLines: formatShippingAddressLines(shippingAddress),
    shippingMethodLabel: 'Standard',
    paymentMethodLabel: paymentMethodLabel(order),
    paymentDetailLine,
  };
}
