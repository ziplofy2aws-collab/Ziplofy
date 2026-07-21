import type { SidebarNode } from '../../sidebar/create-theme-sidebar.types';

const disabledAddBlock = (id: string): SidebarNode => ({
  id,
  label: 'Add block',
  kind: 'add-block',
  disabled: true,
});

/** Shopify-style thank-you page sidebar. */
export function buildCheckoutThankYouSidebarTree(): SidebarNode[] {
  return [
    {
      id: 'checkout:thank-you:announcement-bar',
      label: 'Announcement bar',
      kind: 'block',
      checkoutSection: true,
      children: [disabledAddBlock('checkout:thank-you:announcement-bar:add-block')],
    },
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
        disabledAddBlock('checkout:thank-you:header:add-block'),
      ],
    },
    {
      id: 'checkout:thank-you:group:main',
      label: 'Main',
      kind: 'group-label',
      checkoutMainGroup: true,
      checkoutMainGroupSelectable: true,
      children: [
        {
          id: 'checkout:thank-you:main:confirmation',
          label: 'Confirmation',
          kind: 'block',
          icon: 'confirmation',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
        },
        {
          id: 'checkout:thank-you:main:order-status',
          label: 'Order status',
          kind: 'block',
          icon: 'order-status',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
        },
        {
          id: 'checkout:thank-you:main:order-details',
          label: 'Order details',
          kind: 'block',
          icon: 'receipt',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
          children: [
            {
              id: 'checkout:thank-you:main:order-details:customer-info',
              label: 'Customer information',
              kind: 'field',
              icon: 'checkout-block',
              disabled: true,
            },
          ],
        },
        {
          id: 'checkout:thank-you:main:action',
          label: 'Action',
          kind: 'block',
          icon: 'button',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
        },
        disabledAddBlock('checkout:thank-you:main:add-block'),
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
        disabledAddBlock('checkout:thank-you:order-summary:add-block'),
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
        disabledAddBlock('checkout:thank-you:footer:add-block'),
      ],
    },
  ];
}

export function defaultCheckoutThankYouSidebarExpanded(): Record<string, boolean> {
  return {
    'checkout:thank-you:announcement-bar': true,
    'checkout:header': true,
    'checkout:thank-you:group:main': true,
    'checkout:thank-you:main:order-details': true,
    'checkout:order-summary': true,
    'checkout:footer': true,
  };
}
