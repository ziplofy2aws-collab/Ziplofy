import type { SidebarNode } from '../../sidebar/create-theme-sidebar.types';

/** Shopify-style checkout profile sidebar (Information step). */
export function buildCheckoutProfileSidebarTree(): SidebarNode[] {
  return [
    {
      id: 'checkout:header',
      label: 'Header',
      kind: 'block',
      checkoutSection: true,
      children: [
        {
          id: 'checkout:header:logo',
          label: 'Logo',
          kind: 'field',
          icon: 'checkout-block',
        },
        {
          id: 'checkout:header:cart-link',
          label: 'Cart link',
          kind: 'field',
          icon: 'checkout-block',
          disabled: true,
        },
      ],
    },
    {
      id: 'checkout:group:main',
      label: 'Main',
      kind: 'group-label',
      checkoutMainGroup: true,
      children: [
        {
          id: 'checkout:main:contact',
          label: 'Contact',
          kind: 'block',
          icon: 'contact',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
          children: [
            {
              id: 'checkout:main:contact:email',
              label: 'Email or phone number',
              kind: 'field',
              icon: 'checkout-field',
              disabled: true,
            },
          ],
        },
        {
          id: 'checkout:main:delivery',
          label: 'Delivery',
          kind: 'block',
          icon: 'delivery',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
          children: [
            {
              id: 'checkout:main:delivery:address',
              label: 'Delivery address',
              kind: 'field',
              icon: 'checkout-field',
              disabled: true,
            },
            {
              id: 'checkout:main:delivery:shipping',
              label: 'Shipping method',
              kind: 'block',
              icon: 'checkout-field',
              disabled: true,
              children: [
                {
                  id: 'checkout:main:delivery:shipping:options',
                  label: 'Shipping option list',
                  kind: 'field',
                  icon: 'checkout-field',
                  disabled: true,
                },
              ],
            },
          ],
        },
        {
          id: 'checkout:main:payment',
          label: 'Payment',
          kind: 'block',
          icon: 'payment',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
          children: [
            {
              id: 'checkout:main:payment:option',
              label: 'Payment option',
              kind: 'field',
              icon: 'checkout-field',
              disabled: true,
            },
          ],
        },
        {
          id: 'checkout:main:action',
          label: 'Action',
          kind: 'block',
          icon: 'button',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
          children: [
            {
              id: 'checkout:main:action:pay-now',
              label: 'Pay now',
              kind: 'field',
              icon: 'checkout-field',
              disabled: true,
            },
          ],
        },
      ],
    },
    {
      id: 'checkout:order-summary',
      label: 'Order summary',
      kind: 'block',
      checkoutSection: true,
      children: [
        {
          id: 'checkout:summary:cart',
          label: 'Cart',
          kind: 'block',
          icon: 'cart',
          disabled: true,
          checkoutCategory: true,
          checkoutStatic: true,
          children: [
            {
              id: 'checkout:summary:cart:items',
              label: 'Items in cart',
              kind: 'field',
              icon: 'checkout-field',
              disabled: true,
            },
          ],
        },
        {
          id: 'checkout:summary:total',
          label: 'Total',
          kind: 'block',
          icon: 'receipt',
          disabled: true,
          checkoutCategory: true,
        },
      ],
    },
    {
      id: 'checkout:footer',
      label: 'Footer',
      kind: 'block',
      checkoutSection: true,
      children: [
        {
          id: 'checkout:footer:policies',
          label: 'Policies',
          kind: 'field',
          icon: 'checkout-block',
          disabled: true,
        },
      ],
    },
  ];
}

export function defaultCheckoutProfileSidebarExpanded(): Record<string, boolean> {
  return {
    'checkout:header': true,
    'checkout:group:main': true,
    'checkout:main:delivery:shipping': true,
    'checkout:order-summary': true,
    'checkout:footer': true,
  };
}
