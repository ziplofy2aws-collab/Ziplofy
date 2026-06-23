import type { SidebarNode } from '../../sidebar/create-theme-sidebar.types';

const disabledAddBlock = (id: string): SidebarNode => ({
  id,
  label: 'Add block',
  kind: 'add-block',
  disabled: true,
});

/** Shopify-style customer account orders page sidebar. */
export function buildCheckoutOrdersSidebarTree(): SidebarNode[] {
  return [
    {
      id: 'checkout:orders:announcement-bar',
      label: 'Announcement bar',
      kind: 'block',
      checkoutSection: true,
      children: [disabledAddBlock('checkout:orders:announcement-bar:add-block')],
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
          disabled: true,
        },
        disabledAddBlock('checkout:orders:header:add-block'),
      ],
    },
    {
      id: 'checkout:orders:group:main',
      label: 'Main',
      kind: 'group-label',
      checkoutMainGroup: true,
      children: [
        {
          id: 'checkout:orders:main:order-list',
          label: 'Order list',
          kind: 'block',
          icon: 'cart',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
        },
        {
          id: 'checkout:orders:main:order-actions',
          label: 'Order actions',
          kind: 'block',
          icon: 'button',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
        },
        disabledAddBlock('checkout:orders:main:add-block'),
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
        disabledAddBlock('checkout:orders:footer:add-block'),
      ],
    },
  ];
}

export function defaultCheckoutOrdersSidebarExpanded(): Record<string, boolean> {
  return {
    'checkout:orders:announcement-bar': true,
    'checkout:header': true,
    'checkout:orders:group:main': true,
    'checkout:footer': true,
  };
}
