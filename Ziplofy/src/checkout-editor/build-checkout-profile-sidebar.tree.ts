import type { SidebarNode } from '../create-theme/sidebar/create-theme-sidebar.types';

/** Shopify-style checkout profile sidebar (Information step). */
export function buildCheckoutProfileSidebarTree(): SidebarNode[] {
  return [
    {
      id: 'checkout:group:header',
      label: 'Header',
      kind: 'group-label',
      children: [
        { id: 'checkout:header:logo', label: 'Logo', kind: 'block', icon: 'image' },
        { id: 'checkout:header:cart-link', label: 'Cart link', kind: 'block', icon: 'link' },
      ],
      childrenListKey: 'checkout:header',
    },
    {
      id: 'checkout:group:main',
      label: 'Main',
      kind: 'group-label',
      children: [
        {
          id: 'checkout:main:contact',
          label: 'Contact',
          kind: 'block',
          icon: 'default',
          children: [
            {
              id: 'checkout:main:contact:email',
              label: 'Email or phone number',
              kind: 'field',
              icon: 'text',
            },
          ],
        },
        {
          id: 'checkout:main:delivery',
          label: 'Delivery method',
          kind: 'block',
          icon: 'default',
        },
        {
          id: 'checkout:main:ship',
          label: 'Ship',
          kind: 'block',
          icon: 'default',
          children: [
            {
              id: 'checkout:main:ship:address',
              label: 'Shipping address',
              kind: 'block',
              icon: 'default',
            },
          ],
        },
        {
          id: 'checkout:main:action',
          label: 'Action',
          kind: 'block',
          icon: 'button',
          children: [
            {
              id: 'checkout:main:action:continue',
              label: 'Continue or return',
              kind: 'block',
              icon: 'button',
            },
          ],
        },
      ],
      childrenListKey: 'checkout:main',
    },
    {
      id: 'checkout:group:order-summary',
      label: 'Order summary',
      kind: 'group-label',
      children: [
        {
          id: 'checkout:summary:cart',
          label: 'Cart',
          kind: 'block',
          icon: 'default',
          children: [
            {
              id: 'checkout:summary:cart:items',
              label: 'Items in cart',
              kind: 'block',
              icon: 'product-card',
            },
          ],
        },
        { id: 'checkout:summary:total', label: 'Total', kind: 'block', icon: 'price' },
      ],
      childrenListKey: 'checkout:order-summary',
    },
    {
      id: 'checkout:group:footer',
      label: 'Footer',
      kind: 'group-label',
      children: [
        { id: 'checkout:footer:policies', label: 'Policies', kind: 'block', icon: 'link' },
      ],
      childrenListKey: 'checkout:footer',
    },
  ];
}

export function defaultCheckoutProfileSidebarExpanded(): Record<string, boolean> {
  return {
    'checkout:group:header': true,
    'checkout:group:main': true,
    'checkout:main:contact': true,
    'checkout:main:ship': true,
    'checkout:main:action': true,
    'checkout:group:order-summary': true,
    'checkout:summary:cart': true,
    'checkout:group:footer': true,
  };
}
