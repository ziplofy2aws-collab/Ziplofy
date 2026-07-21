export type CheckoutOrderCardData = {
  id: string;
  orderRefId?: string;
  status: string;
  amount: number;
  dueDate?: string;
  imageUrl?: string | null;
  imageGradient: string;
  showPayNow?: boolean;
  showDueWarning?: boolean;
};

export const CHECKOUT_ORDER_CARD_GRADIENTS = [
  'from-[#f3e8ff] via-[#fce7f3] to-[#fef3c7]',
  'from-[#fde68a] via-[#fcd34d] to-[#d97706]',
  'from-[#dbeafe] via-[#bfdbfe] to-[#93c5fd]',
] as const;

export const CHECKOUT_EXAMPLE_ORDERS: CheckoutOrderCardData[] = [
  {
    id: '1001',
    orderRefId: 'preview-order-1001',
    status: 'On its way',
    amount: 999,
    dueDate: '23 Jul',
    imageGradient: CHECKOUT_ORDER_CARD_GRADIENTS[0],
    showPayNow: true,
    showDueWarning: true,
  },
  {
    id: '1002',
    orderRefId: 'preview-order-1002',
    status: 'Confirmed',
    amount: 799,
    dueDate: '23 Jul',
    imageGradient: CHECKOUT_ORDER_CARD_GRADIENTS[1],
    showPayNow: true,
    showDueWarning: true,
  },
  {
    id: '1003',
    orderRefId: 'preview-order-1003',
    status: 'Delivered',
    amount: 1299,
    imageGradient: CHECKOUT_ORDER_CARD_GRADIENTS[2],
    showPayNow: false,
    showDueWarning: false,
  },
];
