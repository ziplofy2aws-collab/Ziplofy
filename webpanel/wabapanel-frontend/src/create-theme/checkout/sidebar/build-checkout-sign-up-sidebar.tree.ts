import type { SidebarNode } from '../../sidebar/create-theme-sidebar.types';

/** Shopify-style sign-up page sidebar. */
export function buildCheckoutSignUpSidebarTree(): SidebarNode[] {
  return [
    {
      id: 'checkout:signup:group:main',
      label: 'Main',
      kind: 'group-label',
      checkoutMainGroup: true,
      checkoutMainGroupSelectable: true,
      children: [
        {
          id: 'checkout:signup:logo',
          label: 'Logo',
          kind: 'block',
          icon: 'checkout-block',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
        },
        {
          id: 'checkout:signup:options',
          label: 'Sign-up options',
          kind: 'block',
          icon: 'button',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
        },
      ],
    },
  ];
}

export function defaultCheckoutSignUpSidebarExpanded(): Record<string, boolean> {
  return {
    'checkout:signup:group:main': true,
  };
}
