export type CheckoutEditorPage =
  | 'checkout'
  | 'thank-you'
  | 'sign-in'
  | 'signup'
  | 'orders'
  | 'order-status'
  | 'profile';

export type CheckoutEditorPageIcon =
  | 'checkout'
  | 'thank-you'
  | 'sign-in'
  | 'signup'
  | 'orders'
  | 'order-status'
  | 'profile'
  | 'online-store';

export type CheckoutEditorPageMenuItem = {
  pageId: CheckoutEditorPage;
  label: string;
  icon: CheckoutEditorPageIcon;
};

export type CheckoutEditorPageMenuGroup = {
  id: string;
  label: string;
  items: CheckoutEditorPageMenuItem[];
};

export const CHECKOUT_EDITOR_PAGE_MENU: CheckoutEditorPageMenuGroup[] = [
  {
    id: 'checkout',
    label: 'Checkout',
    items: [{ pageId: 'checkout', label: 'Checkout', icon: 'checkout' }],
  },
  {
    id: 'post-purchase',
    label: 'Post purchase',
    items: [{ pageId: 'thank-you', label: 'Thank you', icon: 'thank-you' }],
  },
  {
    id: 'customer-accounts',
    label: 'Customer accounts',
    items: [
      { pageId: 'sign-in', label: 'Sign-in', icon: 'sign-in' },
      { pageId: 'signup', label: 'Sign-up', icon: 'signup' },
      { pageId: 'orders', label: 'Orders', icon: 'orders' },
      { pageId: 'order-status', label: 'Order status', icon: 'order-status' },
      { pageId: 'profile', label: 'Profile', icon: 'profile' },
    ],
  },
];

export function findCheckoutEditorPageLabel(pageId: CheckoutEditorPage): string {
  for (const group of CHECKOUT_EDITOR_PAGE_MENU) {
    const item = group.items.find((entry) => entry.pageId === pageId);
    if (item) return item.label;
  }
  return 'Checkout';
}

export function findCheckoutEditorPageItem(
  pageId: CheckoutEditorPage
): CheckoutEditorPageMenuItem {
  for (const group of CHECKOUT_EDITOR_PAGE_MENU) {
    const item = group.items.find((entry) => entry.pageId === pageId);
    if (item) return item;
  }
  return CHECKOUT_EDITOR_PAGE_MENU[0]!.items[0]!;
}
