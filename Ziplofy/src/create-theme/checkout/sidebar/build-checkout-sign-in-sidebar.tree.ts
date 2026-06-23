import type { SidebarNode } from '../../sidebar/create-theme-sidebar.types';

/** Shopify-style sign-in page sidebar. */
export function buildCheckoutSignInSidebarTree(): SidebarNode[] {
  return [
    {
      id: 'checkout:sign-in:group:main',
      label: 'Main',
      kind: 'group-label',
      checkoutMainGroup: true,
      checkoutMainGroupSelectable: true,
      children: [
        {
          id: 'checkout:sign-in:logo',
          label: 'Logo',
          kind: 'block',
          icon: 'checkout-block',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
        },
        {
          id: 'checkout:sign-in:options',
          label: 'Sign-in options',
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

export function defaultCheckoutSignInSidebarExpanded(): Record<string, boolean> {
  return {
    'checkout:sign-in:group:main': true,
  };
}
