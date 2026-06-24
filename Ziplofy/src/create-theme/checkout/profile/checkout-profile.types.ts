export type CheckoutProfileAddress = {
  id: string;
  name: string;
  lines: string[];
  isDefault?: boolean;
};

export type CheckoutProfileViewData = {
  customerName: string;
  email: string;
  phone: string;
  addresses: CheckoutProfileAddress[];
  storeCredit: number;
  marketingEmailOptIn: boolean;
};

export const CHECKOUT_EXAMPLE_PROFILE: CheckoutProfileViewData = {
  customerName: 'Effie Fay',
  email: 'effie.fay@example.com',
  phone: '+91 11 2327 7705',
  addresses: [
    {
      id: '1',
      name: 'Maxie Ullrich',
      isDefault: true,
      lines: [
        'Netaji Subhash Marg, Lal Qila, Chandni Chowk',
        '110006 New Delhi Delhi',
        'India',
      ],
    },
    {
      id: '2',
      name: 'Maxie Ullrich',
      lines: [
        'Netaji Subhash Marg, Lal Qila, Chandni Chowk',
        '110006 New Delhi Delhi',
        'India',
      ],
    },
  ],
  storeCredit: 100,
  marketingEmailOptIn: true,
};
