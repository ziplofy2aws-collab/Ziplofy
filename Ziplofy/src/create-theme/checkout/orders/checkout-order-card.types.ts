export type CheckoutOrderCardData = {
  id: string;
  status: string;
  amount: number;
  dueDate: string;
  imageGradient: string;
};

export const CHECKOUT_ORDER_CARD_GRADIENTS = [
  'from-[#f3e8ff] via-[#fce7f3] to-[#fef3c7]',
  'from-[#fde68a] via-[#fcd34d] to-[#d97706]',
] as const;

export const CHECKOUT_EXAMPLE_ORDERS: CheckoutOrderCardData[] = [
  {
    id: '1001',
    status: 'On its way',
    amount: 999,
    dueDate: '22 Jul',
    imageGradient: CHECKOUT_ORDER_CARD_GRADIENTS[0],
  },
  {
    id: '1002',
    status: 'Confirmed',
    amount: 799,
    dueDate: '12 Jul',
    imageGradient: CHECKOUT_ORDER_CARD_GRADIENTS[1],
  },
];
