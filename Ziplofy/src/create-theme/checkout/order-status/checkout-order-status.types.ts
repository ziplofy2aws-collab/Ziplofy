export type CheckoutOrderStatusLineItem = {
  id: string;
  title: string;
  variant: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  imageGradient: string;
  fulfillmentStatus: 'delivered' | 'confirmed' | 'shipped';
  statusDate: string;
  headline: string | null;
};

export type CheckoutOrderStatusDetails = {
  orderNumber: string;
  confirmedDate: string;
  dueDate: string;
  dueDateLong: string;
  amountDue: number;
  amountPaid: number;
  subtotal: number;
  shippingLabel: string;
  total: number;
  showPaymentCard: boolean;
  lineItems: CheckoutOrderStatusLineItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddressLines: string[];
  shippingMethodLabel: string;
  paymentMethodLabel: string;
  paymentDetailLine: string | null;
};

export const CHECKOUT_ORDER_STATUS_GRADIENTS = [
  'from-[#f3e8ff] via-[#fce7f3] to-[#fef3c7]',
  'from-[#fde68a] via-[#fcd34d] to-[#d97706]',
] as const;

export const CHECKOUT_ORDER_STATUS_PREVIEW: CheckoutOrderStatusDetails = {
  orderNumber: '1004',
  confirmedDate: '14 Jun',
  dueDate: '23 Jul',
  dueDateLong: '23 July',
  amountDue: 899,
  amountPaid: 899,
  subtotal: 1798,
  shippingLabel: 'Free',
  total: 1798,
  showPaymentCard: true,
  lineItems: [
    {
      id: '1',
      title:
        'Powerful 7 Chakra Stone Frame | Healing Gemstone Wall Hanging for Positive Energy & Balance',
      variant: 'Default Title',
      price: 999,
      quantity: 1,
      imageGradient: CHECKOUT_ORDER_STATUS_GRADIENTS[0],
      fulfillmentStatus: 'delivered',
      statusDate: '22 Jun',
      headline: 'Delivered 22 Jun',
    },
    {
      id: '2',
      title: 'Seven Chakra Diary - with 7 Authentic Semi Precious Stones',
      variant: 'Default Title',
      price: 799,
      quantity: 1,
      imageGradient: CHECKOUT_ORDER_STATUS_GRADIENTS[1],
      fulfillmentStatus: 'confirmed',
      statusDate: '14 Jun',
      headline: null,
    },
  ],
  customerName: 'Alaina Kuvalis',
  customerEmail: 'alaina.kuvalis@example.com',
  customerPhone: '+91 11 2327 7705',
  shippingAddressLines: [
    'Alaina Kuvalis',
    'Netaji Subhash Marg, Lal Qila, Chandni Chowk',
    '110006 New Delhi Delhi',
    'India',
    '+91 11 2327 7705',
  ],
  shippingMethodLabel: 'Standard (Example)',
  paymentMethodLabel: 'Visa · 4242',
  paymentDetailLine: '₹899.00 INR · 24 Jun',
};
