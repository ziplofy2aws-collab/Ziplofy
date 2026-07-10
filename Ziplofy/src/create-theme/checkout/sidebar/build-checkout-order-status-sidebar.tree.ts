import type { SidebarNode } from '../../sidebar/create-theme-sidebar.types';

const disabledAddBlock = (id: string): SidebarNode => ({
  id,
  label: 'Add block',
  kind: 'add-block',
  disabled: true,
});

/** Shopify-style customer account order status page sidebar. */
export function buildCheckoutOrderStatusSidebarTree(): SidebarNode[] {
  return [
    {
      id: 'checkout:order-status:announcement-bar',
      label: 'Announcement bar',
      kind: 'block',
      checkoutSection: true,
      children: [disabledAddBlock('checkout:order-status:announcement-bar:add-block')],
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
        disabledAddBlock('checkout:order-status:header:add-block'),
      ],
    },
    {
      id: 'checkout:order-status:group:main',
      label: 'Main',
      kind: 'group-label',
      checkoutMainGroup: true,
      children: [
        {
          id: 'checkout:order-status:main:page-header',
          label: 'Page header',
          kind: 'block',
          icon: 'receipt',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
          children: [
            {
              id: 'checkout:order-status:main:page-header:order-actions',
              label: 'Order actions',
              kind: 'field',
              icon: 'checkout-block',
              disabled: true,
            },
          ],
        },
        {
          id: 'checkout:order-status:main:payment-status',
          label: 'Payment status',
          kind: 'block',
          icon: 'receipt',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
          children: [
            {
              id: 'checkout:order-status:main:payment-status:payment-details',
              label: 'Payment details',
              kind: 'field',
              icon: 'checkout-block',
              disabled: true,
            },
          ],
        },
        {
          id: 'checkout:order-status:main:order-status',
          label: 'Order status',
          kind: 'block',
          icon: 'order-status',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
          children: [
            {
              id: 'checkout:order-status:main:order-status:return-status',
              label: 'Return status',
              kind: 'field',
              icon: 'checkout-block',
              disabled: true,
            },
            {
              id: 'checkout:order-status:main:order-status:fulfillment-status',
              label: 'Fulfillment status',
              kind: 'field',
              icon: 'checkout-block',
              disabled: true,
            },
            {
              id: 'checkout:order-status:main:order-status:unfulfilled-items',
              label: 'Unfulfilled items',
              kind: 'field',
              icon: 'checkout-block',
              disabled: true,
            },
          ],
        },
        {
          id: 'checkout:order-status:main:order-summary',
          label: 'Order summary',
          kind: 'block',
          icon: 'cart',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
          children: [
            {
              id: 'checkout:order-status:main:order-summary:items',
              label: 'Items',
              kind: 'field',
              icon: 'checkout-block',
              disabled: true,
            },
            {
              id: 'checkout:order-status:main:order-summary:total',
              label: 'Total',
              kind: 'field',
              icon: 'checkout-block',
              disabled: true,
            },
          ],
        },
        {
          id: 'checkout:order-status:main:order-details',
          label: 'Order details',
          kind: 'block',
          icon: 'receipt',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
          children: [
            {
              id: 'checkout:order-status:main:order-details:customer-info',
              label: 'Customer information',
              kind: 'field',
              icon: 'checkout-block',
              disabled: true,
            },
          ],
        },
        disabledAddBlock('checkout:order-status:main:add-block'),
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
        disabledAddBlock('checkout:order-status:footer:add-block'),
      ],
    },
  ];
}

export function defaultCheckoutOrderStatusSidebarExpanded(): Record<string, boolean> {
  return {
    'checkout:order-status:announcement-bar': true,
    'checkout:header': true,
    'checkout:order-status:group:main': true,
    'checkout:order-status:main:page-header': true,
    'checkout:order-status:main:payment-status': true,
    'checkout:order-status:main:order-status': true,
    'checkout:order-status:main:order-summary': true,
    'checkout:order-status:main:order-details': true,
    'checkout:footer': true,
  };
}
