export const CART_TEMPLATE_ID = 'cart';
export const CART_MAIN_SECTION_ID = 'cart_main';

function defaultCartMainSection(): Record<string, unknown> {
  return {
    type: 'cart-main',
    enabled: true,
    settings: {
      title: 'Your cart',
      subtitle: 'Review items before checkout',
      shippingNote: 'Shipping calculated at checkout',
      taxDisclaimer: 'Taxes may apply',
    },
    blocks: {
      empty_state: {
        type: 'empty-state',
        blocks: {
          empty_message: {
            type: 'empty-message',
            settings: {
              emptyTitle: 'Your cart is empty',
            },
          },
          continue_link: {
            type: 'continue-link',
            settings: {
              label: 'Continue shopping',
              href: '/',
            },
          },
        },
        block_order: ['empty_message', 'continue_link'],
      },
      line_items: {
        type: 'line-items',
        blocks: {
          item_actions: {
            type: 'item-actions',
            settings: {
              removeLabel: 'Remove',
              loadingLabel: 'Loading…',
            },
          },
        },
        block_order: ['item_actions'],
      },
      cart_summary: {
        type: 'cart-summary',
        blocks: {
          subtotal: {
            type: 'subtotal',
            settings: {
              label: 'Subtotal:',
            },
          },
          checkout_button: {
            type: 'checkout',
            settings: {
              label: 'Proceed to checkout',
              helperText: '',
            },
          },
          shipping_line: {
            type: 'shipping',
            settings: {
              label: 'Shipping',
              fallback: 'Calculated at checkout',
            },
          },
        },
        block_order: ['subtotal', 'shipping_line', 'checkout_button'],
      },
    },
    block_order: ['empty_state', 'line_items', 'cart_summary'],
  };
}

/** Ensure the cart page template has a cart_main section (for editor + published themes). */
export function ensureCartPageTemplateBlocks(config: Record<string, unknown>): boolean {
  if (!config.templates || typeof config.templates !== 'object') {
    config.templates = {};
  }
  const templates = config.templates as Record<string, Record<string, unknown>>;
  let tpl = templates[CART_TEMPLATE_ID];
  if (!tpl || typeof tpl !== 'object') {
    tpl = { name: 'Cart', sections: {}, section_order: [] };
    templates[CART_TEMPLATE_ID] = tpl;
  }
  if (!tpl.sections || typeof tpl.sections !== 'object') {
    tpl.sections = {};
  }
  const sections = tpl.sections as Record<string, unknown>;
  let changed = false;
  if (!sections[CART_MAIN_SECTION_ID]) {
    sections[CART_MAIN_SECTION_ID] = defaultCartMainSection();
    changed = true;
  }
  const order = Array.isArray(tpl.section_order) ? [...tpl.section_order] : [];
  if (!order.includes(CART_MAIN_SECTION_ID)) {
    tpl.section_order = [CART_MAIN_SECTION_ID, ...order];
    changed = true;
  }
  return changed;
}
