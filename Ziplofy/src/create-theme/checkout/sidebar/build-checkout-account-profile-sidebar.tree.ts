import type { SidebarNode } from '../../sidebar/create-theme-sidebar.types';

const disabledAddBlock = (id: string): SidebarNode => ({
  id,
  label: 'Add block',
  kind: 'add-block',
  disabled: true,
});

/** Shopify-style customer account profile page sidebar. */
export function buildCheckoutAccountProfileSidebarTree(): SidebarNode[] {
  return [
    {
      id: 'checkout:profile:announcement-bar',
      label: 'Announcement bar',
      kind: 'block',
      checkoutSection: true,
      children: [disabledAddBlock('checkout:profile:announcement-bar:add-block')],
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
        disabledAddBlock('checkout:profile:header:add-block'),
      ],
    },
    {
      id: 'checkout:profile:group:main',
      label: 'Main',
      kind: 'group-label',
      checkoutMainGroup: true,
      children: [
        {
          id: 'checkout:profile:main:customer-contact',
          label: 'Customer contact',
          kind: 'block',
          icon: 'contact',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
        },
        {
          id: 'checkout:profile:main:addresses',
          label: 'Addresses',
          kind: 'block',
          icon: 'delivery',
          disabled: true,
          checkoutMainCategory: true,
          checkoutStatic: true,
          children: [
            {
              id: 'checkout:profile:main:addresses:list',
              label: 'Address list',
              kind: 'field',
              icon: 'checkout-field',
              disabled: true,
            },
          ],
        },
        disabledAddBlock('checkout:profile:main:add-block'),
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
        disabledAddBlock('checkout:profile:footer:add-block'),
      ],
    },
  ];
}

export function defaultCheckoutAccountProfileSidebarExpanded(): Record<string, boolean> {
  return {
    'checkout:profile:announcement-bar': true,
    'checkout:header': true,
    'checkout:profile:group:main': true,
    'checkout:profile:main:addresses': true,
    'checkout:footer': true,
  };
}
