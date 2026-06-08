/**
 * Deepens theme.schema.json + theme.default-config.json for bloom, horizon, studio, and volt.
 * Idempotent — safe to re-run after sync-deep-theme-packs.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PACKS = path.join(ROOT, 'Ziplofy', 'src', 'theme-packs');
const B3 = path.join(ROOT, 'Ziplofy3b', 'src', 'theme-packs');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function field(path, type, label, extra = {}) {
  return { path, type, label, ...extra };
}

function hasPath(list, sub) {
  return (list || []).some((f) => f.path?.includes(sub));
}

function pushField(target, f) {
  if (!hasPath(target.settingsFields, f.path.split('.').pop())) {
    target.settingsFields = target.settingsFields || [];
    target.settingsFields.push(f);
  }
}

function findBlock(container, id) {
  return (container.blocks || []).find((b) => b.id === id);
}

function ensureBlock(parent, block) {
  parent.blocks = parent.blocks || [];
  const existing = parent.blocks.find((b) => b.id === block.id);
  if (existing) {
    if (block.settingsFields) {
      for (const f of block.settingsFields) {
        if (!hasPath(existing.settingsFields, f.path.split('.').pop())) {
          existing.settingsFields = existing.settingsFields || [];
          existing.settingsFields.push(f);
        }
      }
    }
    if (block.blocks) {
      for (const child of block.blocks) ensureBlock(existing, child);
    }
    return existing;
  }
  parent.blocks.push(block);
  return block;
}

function tpl(schema, id) {
  return schema.templates?.find((t) => t.id === id);
}

function sec(schema, tplId, secId) {
  return tpl(schema, tplId)?.sections?.find((s) => s.id === secId);
}

function setDeep(obj, keyPath, value) {
  const parts = keyPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p];
  }
  const last = parts[parts.length - 1];
  if (cur[last] === undefined) cur[last] = value;
}

function enrichStandardSchema(schema, indexSectionId) {
  // --- Global ---
  const colors = schema.globalSettings?.groups?.find((g) => g.id === 'colors');
  if (colors) {
    for (const f of [
      field('settings.colors.accent', 'color', 'Accent'),
      field('settings.colors.surface', 'color', 'Surface'),
      field('settings.colors.muted', 'color', 'Muted text'),
      field('settings.colors.border', 'color', 'Border'),
    ]) {
      if (!hasPath(colors.fields, 'accent') && f.path.includes('accent')) colors.fields.push(f);
      else if (!hasPath(colors.fields, f.path.split('.').pop())) colors.fields.push(f);
    }
  }
  const typo = schema.globalSettings?.groups?.find((g) => g.id === 'typography');
  if (typo) {
    for (const f of [
      field('settings.typography.baseSize', 'number', 'Base font size (px)'),
      field('settings.typography.lineHeight', 'number', 'Line height'),
      field('settings.typography.headingWeight', 'number', 'Heading weight'),
    ]) {
      if (!hasPath(typo.fields, f.path.split('.').pop())) typo.fields.push(f);
    }
  }
  if (!schema.globalSettings.groups.some((g) => g.id === 'spacing')) {
    schema.globalSettings.groups.push({
      id: 'spacing',
      label: 'Spacing & layout',
      fields: [
        field('settings.spacing.sectionGap', 'number', 'Section gap (px)'),
        field('settings.spacing.contentMaxWidth', 'number', 'Max content width (px)'),
        field('settings.spacing.pagePadding', 'number', 'Page horizontal padding (px)'),
      ],
    });
  }

  // --- Layout header/footer ---
  const header = schema.layout?.header;
  if (header) {
    pushField(header, field('sections.header.settings.showSearch', 'boolean', 'Show search'));
    pushField(header, field('sections.header.settings.searchPlaceholder', 'text', 'Search placeholder'));
    pushField(header, field('sections.header.settings.cartLabel', 'text', 'Cart label'));
    const menu = findBlock(header, 'menu');
    if (menu) {
      ensureBlock(menu, {
        id: 'link_account',
        label: 'Account',
        settingsFields: [
          field('sections.header.blocks.menu.settings.items.3.label', 'text', 'Label'),
          field('sections.header.blocks.menu.settings.items.3.href', 'text', 'Link'),
        ],
      });
    }
  }
  const ann = schema.layout?.announcement_bar;
  if (ann) {
    pushField(ann, field('sections.announcement_bar.settings.dismissible', 'boolean', 'Dismissible'));
    pushField(ann, field('sections.announcement_bar.settings.icon', 'text', 'Leading icon (emoji or short text)'));
  }
  const footer = schema.layout?.footer;
  if (footer) {
    const newsletter = findBlock(footer, 'newsletter');
    if (newsletter) {
      pushField(newsletter, field('sections.footer.blocks.newsletter.settings.privacyNote', 'text', 'Privacy note'));
      pushField(newsletter, field('sections.footer.blocks.newsletter.settings.buttonLabel', 'text', 'Subscribe button'));
    }
    ensureBlock(footer, {
      id: 'social_links',
      label: 'Social links',
      settingsFields: [
        field('sections.footer.blocks.social_links.settings.instagramLabel', 'text', 'Instagram label'),
        field('sections.footer.blocks.social_links.settings.instagramHref', 'text', 'Instagram URL'),
        field('sections.footer.blocks.social_links.settings.twitterLabel', 'text', 'Twitter label'),
        field('sections.footer.blocks.social_links.settings.twitterHref', 'text', 'Twitter URL'),
      ],
    });
  }

  // --- Index ---
  const hero = sec(schema, 'index', 'hero_main');
  if (hero) {
    pushField(hero, field('templates.index.sections.hero_main.settings.minHeight', 'number', 'Min height (px)'));
    pushField(hero, field('templates.index.sections.hero_main.settings.backgroundTone', 'select', 'Background tone', {
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'gradient', label: 'Gradient' },
      ],
    }));
    pushField(hero, field('templates.index.sections.hero_main.settings.fullWidth', 'boolean', 'Full width'));
    pushField(hero, field('templates.index.sections.hero_main.settings.overlayOpacity', 'number', 'Overlay opacity (0–1)'));
    for (const btn of ['primary_button', 'secondary_button']) {
      const b = findBlock(hero, btn);
      if (b) {
        pushField(b, field(`templates.index.sections.hero_main.blocks.${btn}.settings.openInNewTab`, 'boolean', 'Open in new tab'));
        pushField(b, field(`templates.index.sections.hero_main.blocks.${btn}.settings.ariaLabel`, 'text', 'Accessibility label'));
      }
    }
  }
  const collection = sec(schema, 'index', indexSectionId);
  if (collection) {
    const base = `templates.index.sections.${indexSectionId}`;
    pushField(collection, field(`${base}.settings.subtitle`, 'textarea', 'Section subtitle'));
    pushField(collection, field(`${base}.settings.columns`, 'number', 'Columns (desktop)'));
    pushField(collection, field(`${base}.settings.gap`, 'number', 'Card gap (px)'));
    pushField(collection, field(`${base}.settings.showRating`, 'boolean', 'Show ratings'));
    pushField(collection, field(`${base}.settings.emptyMessage`, 'text', 'Empty collection message'));
    const headerBlk = findBlock(collection, 'collection_header');
    if (headerBlk) {
      pushField(headerBlk, field(`${base}.blocks.collection_header.settings.subtitle`, 'text', 'Header subtitle'));
    }
    const card = findBlock(collection, 'product_card');
    if (card) {
      ensureBlock(card, {
        id: 'quick_view',
        label: 'Quick view',
        settingsFields: [
          field(`${base}.blocks.product_card.blocks.quick_view.settings.label`, 'text', 'Button label'),
          field(`${base}.blocks.product_card.blocks.quick_view.settings.show`, 'boolean', 'Show quick view'),
        ],
      });
      ensureBlock(card, {
        id: 'badge',
        label: 'Badge',
        settingsFields: [
          field(`${base}.blocks.product_card.blocks.badge.settings.saleLabel`, 'text', 'Sale badge text'),
          field(`${base}.blocks.product_card.blocks.badge.settings.newLabel`, 'text', 'New badge text'),
        ],
      });
    }
  }

  // --- Product ---
  const product = sec(schema, 'product', 'product_main');
  if (product) {
    pushField(product, field('templates.product.sections.product_main.settings.layoutMode', 'select', 'Layout', {
      options: [
        { value: 'stacked', label: 'Stacked' },
        { value: 'split', label: 'Split' },
      ],
    }));
    pushField(product, field('templates.product.sections.product_main.settings.showSku', 'boolean', 'Show SKU'));
    pushField(product, field('templates.product.sections.product_main.settings.stickyBuyBox', 'boolean', 'Sticky buy box'));
    const media = findBlock(product, 'product_media');
    if (media) {
      pushField(media, field('templates.product.sections.product_main.blocks.product_media.settings.imageAspectRatio', 'text', 'Image aspect ratio'));
      pushField(media, field('templates.product.sections.product_main.blocks.product_media.settings.zoomHint', 'text', 'Zoom hint text'));
    }
    const buyBox = findBlock(product, 'buy_box');
    if (buyBox) {
      ensureBlock(buyBox, {
        id: 'quantity_field',
        label: 'Quantity',
        settingsFields: [
          field('templates.product.sections.product_main.blocks.buy_box.blocks.quantity_field.settings.label', 'text', 'Quantity label'),
          field('templates.product.sections.product_main.blocks.buy_box.blocks.quantity_field.settings.min', 'number', 'Minimum quantity'),
        ],
      });
      ensureBlock(buyBox, {
        id: 'buy_now_button',
        label: 'Buy now',
        settingsFields: [
          field('templates.product.sections.product_main.blocks.buy_box.blocks.buy_now_button.settings.label', 'text', 'Button label'),
          field('templates.product.sections.product_main.blocks.buy_box.blocks.buy_now_button.settings.href', 'text', 'Checkout URL override'),
        ],
      });
    }
    const content = findBlock(product, 'product_content');
    if (content) {
      ensureBlock(content, {
        id: 'size_guide',
        label: 'Size guide',
        settingsFields: [
          field('templates.product.sections.product_main.blocks.product_content.blocks.size_guide.settings.label', 'text', 'Link label'),
          field('templates.product.sections.product_main.blocks.product_content.blocks.size_guide.settings.href', 'text', 'Guide URL'),
        ],
      });
    }
    ensureBlock(product, {
      id: 'trust_badges',
      label: 'Trust badges',
      blocks: [
        {
          id: 'shipping_badge',
          label: 'Shipping',
          settingsFields: [
            field('templates.product.sections.product_main.blocks.trust_badges.blocks.shipping_badge.settings.text', 'text', 'Text'),
          ],
        },
        {
          id: 'returns_badge',
          label: 'Returns',
          settingsFields: [
            field('templates.product.sections.product_main.blocks.trust_badges.blocks.returns_badge.settings.text', 'text', 'Text'),
          ],
        },
      ],
    });
  }

  // --- Cart ---
  const cart = sec(schema, 'cart', 'cart_main');
  if (cart) {
    pushField(cart, field('templates.cart.sections.cart_main.settings.subtitle', 'textarea', 'Subtitle'));
    pushField(cart, field('templates.cart.sections.cart_main.settings.shippingNote', 'text', 'Shipping note'));
    pushField(cart, field('templates.cart.sections.cart_main.settings.taxDisclaimer', 'text', 'Tax disclaimer'));
    const empty = findBlock(cart, 'empty_state');
    if (empty) {
      const msg = findBlock(empty, 'empty_message');
      if (msg) pushField(msg, field('templates.cart.sections.cart_main.blocks.empty_state.blocks.empty_message.settings.emptySubtitle', 'text', 'Secondary line'));
    }
    const summary = findBlock(cart, 'cart_summary');
    if (summary) {
      ensureBlock(summary, {
        id: 'checkout_button',
        label: 'Checkout button',
        settingsFields: [
          field('templates.cart.sections.cart_main.blocks.cart_summary.blocks.checkout_button.settings.label', 'text', 'Button label'),
          field('templates.cart.sections.cart_main.blocks.cart_summary.blocks.checkout_button.settings.helperText', 'text', 'Helper text'),
        ],
      });
      ensureBlock(summary, {
        id: 'shipping_line',
        label: 'Shipping estimate',
        settingsFields: [
          field('templates.cart.sections.cart_main.blocks.cart_summary.blocks.shipping_line.settings.label', 'text', 'Label'),
          field('templates.cart.sections.cart_main.blocks.cart_summary.blocks.shipping_line.settings.fallback', 'text', 'Fallback text'),
        ],
      });
    }
    const lines = findBlock(cart, 'line_items');
    if (lines) {
      const actions = findBlock(lines, 'item_actions');
      if (actions) {
        pushField(actions, field('templates.cart.sections.cart_main.blocks.line_items.blocks.item_actions.settings.quantityLabel', 'text', 'Quantity label'));
        pushField(actions, field('templates.cart.sections.cart_main.blocks.line_items.blocks.item_actions.settings.priceLabel', 'text', 'Price label'));
      }
    }
  }

  // --- Login ---
  const login = sec(schema, 'login', 'login_main');
  if (login) {
    pushField(login, field('templates.login.sections.login_main.settings.backgroundStyle', 'select', 'Background style', {
      options: [
        { value: 'plain', label: 'Plain' },
        { value: 'split', label: 'Split panel' },
        { value: 'image', label: 'Image' },
      ],
    }));
    pushField(login, field('templates.login.sections.login_main.settings.sidePanelTitle', 'text', 'Side panel title'));
    const form = findBlock(login, 'form_fields');
    if (form) {
      for (const [bid, labelKey] of [
        ['email_field', 'Email label'],
        ['password_field', 'Password label'],
      ]) {
        const b = findBlock(form, bid);
        if (b) pushField(b, field(`templates.login.sections.login_main.blocks.form_fields.blocks.${bid}.settings.label`, 'text', labelKey));
      }
    }
    ensureBlock(login, {
      id: 'remember_me',
      label: 'Remember me',
      settingsFields: [
        field('templates.login.sections.login_main.blocks.remember_me.settings.label', 'text', 'Checkbox label'),
      ],
    });
  }

  // --- Signup ---
  const signup = sec(schema, 'signup', 'signup_main');
  if (signup) {
    pushField(signup, field('templates.signup.sections.signup_main.settings.termsIntro', 'text', 'Terms intro'));
    const form = findBlock(signup, 'form_fields');
    if (form) {
      ensureBlock(form, {
        id: 'confirm_password_field',
        label: 'Confirm password',
        settingsFields: [
          field('templates.signup.sections.signup_main.blocks.form_fields.blocks.confirm_password_field.settings.placeholder', 'text', 'Placeholder'),
          field('templates.signup.sections.signup_main.blocks.form_fields.blocks.confirm_password_field.settings.label', 'text', 'Field label'),
        ],
      });
    }
    ensureBlock(signup, {
      id: 'terms_checkbox',
      label: 'Terms acceptance',
      settingsFields: [
        field('templates.signup.sections.signup_main.blocks.terms_checkbox.settings.label', 'text', 'Checkbox label'),
        field('templates.signup.sections.signup_main.blocks.terms_checkbox.settings.href', 'text', 'Terms URL'),
      ],
    });
  }

  // --- Forgot ---
  const forgot = sec(schema, 'forgot_password', 'forgot_main');
  if (forgot) {
    const email = findBlock(findBlock(forgot, 'form_fields'), 'email_field');
    if (email) pushField(email, field('templates.forgot_password.sections.forgot_main.blocks.form_fields.blocks.email_field.settings.label', 'text', 'Field label'));
    pushField(findBlock(forgot, 'primary_button'), field('templates.forgot_password.sections.forgot_main.blocks.primary_button.settings.loadingLabel', 'text', 'Loading label'));
    ensureBlock(forgot, {
      id: 'resend_hint',
      label: 'Resend hint',
      settingsFields: [
        field('templates.forgot_password.sections.forgot_main.blocks.resend_hint.settings.text', 'text', 'Hint text'),
      ],
    });
  }

  // --- Profile ---
  const profile = sec(schema, 'profile', 'profile_main');
  if (profile) {
    pushField(profile, field('templates.profile.sections.profile_main.settings.avatarSize', 'number', 'Avatar size (px)'));
    ensureBlock(profile, {
      id: 'avatar',
      label: 'Avatar',
      settingsFields: [
        field('templates.profile.sections.profile_main.blocks.avatar.settings.initialsFallback', 'text', 'Initials fallback'),
        field('templates.profile.sections.profile_main.blocks.avatar.settings.show', 'boolean', 'Show avatar'),
      ],
    });
    const form = findBlock(profile, 'profile_form');
    if (form) {
      ensureBlock(form, {
        id: 'address_section',
        label: 'Address',
        settingsFields: [
          field('templates.profile.sections.profile_main.blocks.profile_form.blocks.address_section.settings.heading', 'text', 'Section heading'),
          field('templates.profile.sections.profile_main.blocks.profile_form.blocks.address_section.settings.helperText', 'text', 'Helper text'),
        ],
      });
    }
    const save = findBlock(profile, 'save_button');
    if (save) pushField(save, field('templates.profile.sections.profile_main.blocks.save_button.settings.successLabel', 'text', 'Success label'));
    const signedOut = findBlock(profile, 'signed_out');
    if (signedOut) {
      const btn = findBlock(signedOut, 'sign_in_button');
      if (btn) pushField(btn, field('templates.profile.sections.profile_main.blocks.signed_out.blocks.sign_in_button.settings.href', 'text', 'Sign-in URL'));
    }
  }

  // --- Orders ---
  const orders = sec(schema, 'orders', 'orders_main');
  if (orders) {
    const empty = findBlock(orders, 'empty_state');
    if (empty) {
      pushField(empty, field('templates.orders.sections.orders_main.blocks.empty_state.settings.ctaLabel', 'text', 'CTA label'));
      pushField(empty, field('templates.orders.sections.orders_main.blocks.empty_state.settings.ctaHref', 'text', 'CTA URL'));
    }
    const card = findBlock(orders, 'order_card');
    if (card) {
      ensureBlock(card, {
        id: 'order_number_line',
        label: 'Order number',
        settingsFields: [
          field('templates.orders.sections.orders_main.blocks.order_card.blocks.order_number_line.settings.prefix', 'text', 'Number prefix'),
        ],
      });
      ensureBlock(card, {
        id: 'view_details',
        label: 'View details',
        settingsFields: [
          field('templates.orders.sections.orders_main.blocks.order_card.blocks.view_details.settings.label', 'text', 'Link label'),
        ],
      });
      ensureBlock(card, {
        id: 'items_count_line',
        label: 'Items count',
        settingsFields: [
          field('templates.orders.sections.orders_main.blocks.order_card.blocks.items_count_line.settings.suffix', 'text', 'Items suffix'),
        ],
      });
    }
  }

  // --- Preferences ---
  const prefs = sec(schema, 'preferences', 'preferences_main');
  if (prefs) {
    ensureBlock(prefs, {
      id: 'privacy_options',
      label: 'Privacy',
      blocks: [
        {
          id: 'cookies_toggle',
          label: 'Cookies',
          settingsFields: [
            field('templates.preferences.sections.preferences_main.blocks.privacy_options.blocks.cookies_toggle.settings.label', 'text', 'Label'),
            field('templates.preferences.sections.preferences_main.blocks.privacy_options.blocks.cookies_toggle.settings.description', 'text', 'Description'),
          ],
        },
        {
          id: 'analytics_toggle',
          label: 'Analytics',
          settingsFields: [
            field('templates.preferences.sections.preferences_main.blocks.privacy_options.blocks.analytics_toggle.settings.label', 'text', 'Label'),
          ],
        },
      ],
    });
    const marketing = findBlock(prefs, 'marketing_options');
    if (marketing) {
      for (const bid of ['email_marketing', 'sms_marketing']) {
        const b = findBlock(marketing, bid);
        if (b) pushField(b, field(`templates.preferences.sections.preferences_main.blocks.marketing_options.blocks.${bid}.settings.description`, 'text', 'Description'));
      }
    }
  }

  return schema;
}

function enrichStandardDefaultConfig(dc, indexSectionId) {
  setDeep(dc, 'settings.colors.accent', dc.settings?.colors?.primary ?? '#000');
  setDeep(dc, 'settings.colors.surface', dc.settings?.colors?.background ?? '#fff');
  setDeep(dc, 'settings.colors.muted', '#6b7280');
  setDeep(dc, 'settings.colors.border', '#e5e7eb');
  setDeep(dc, 'settings.typography.baseSize', 16);
  setDeep(dc, 'settings.typography.lineHeight', 1.5);
  setDeep(dc, 'settings.typography.headingWeight', 600);
  setDeep(dc, 'settings.spacing.sectionGap', 48);
  setDeep(dc, 'settings.spacing.contentMaxWidth', 1200);
  setDeep(dc, 'settings.spacing.pagePadding', 24);

  const hero = dc.templates?.index?.sections?.hero_main;
  if (hero?.settings) {
    setDeep(hero.settings, 'minHeight', 520);
    setDeep(hero.settings, 'backgroundTone', 'gradient');
    setDeep(hero.settings, 'fullWidth', false);
    setDeep(hero.settings, 'overlayOpacity', 0.35);
  }

  const coll = dc.templates?.index?.sections?.[indexSectionId];
  if (coll?.settings) {
    setDeep(coll.settings, 'subtitle', 'Hand-picked for you');
    setDeep(coll.settings, 'columns', 4);
    setDeep(coll.settings, 'gap', 24);
    setDeep(coll.settings, 'showRating', true);
    setDeep(coll.settings, 'emptyMessage', 'No products yet.');
    coll.blocks = coll.blocks || {};
    coll.blocks.collection_header = coll.blocks.collection_header || { type: 'header', settings: {} };
    setDeep(coll.blocks.collection_header.settings, 'subtitle', 'Curated selection');
    coll.blocks.product_card = coll.blocks.product_card || { type: 'card', settings: {}, blocks: {} };
    coll.blocks.product_card.blocks = coll.blocks.product_card.blocks || {};
    coll.blocks.product_card.blocks.quick_view = { type: 'quick-view', settings: { label: 'Quick view', show: true } };
    coll.blocks.product_card.blocks.badge = { type: 'badge', settings: { saleLabel: 'Sale', newLabel: 'New' } };
    coll.blocks.product_card.block_order = ['media', 'product_title', 'price', 'quick_view', 'badge'];
    coll.blocks.product_card.nested_block_order = coll.blocks.product_card.block_order;
  }

  const product = dc.templates?.product?.sections?.product_main;
  if (product) {
    product.settings = product.settings || {};
    setDeep(product.settings, 'layoutMode', 'split');
    setDeep(product.settings, 'showSku', false);
    setDeep(product.settings, 'stickyBuyBox', true);
    product.blocks = product.blocks || {};
    product.blocks.buy_box = product.blocks.buy_box || { type: 'buy-box', blocks: {} };
    product.blocks.buy_box.blocks = product.blocks.buy_box.blocks || {};
    product.blocks.buy_box.blocks.quantity_field = { type: 'qty', settings: { label: 'Quantity', min: 1 } };
    product.blocks.buy_box.blocks.buy_now_button = { type: 'buy-now', settings: { label: 'Buy now', href: '' } };
    product.blocks.buy_box.block_order = ['quantity_field', 'add_to_cart_button', 'buy_now_button'];
    product.blocks.trust_badges = {
      type: 'trust',
      blocks: {
        shipping_badge: { type: 'badge', settings: { text: 'Free shipping over ₹799' } },
        returns_badge: { type: 'badge', settings: { text: '30-day returns' } },
      },
      block_order: ['shipping_badge', 'returns_badge'],
    };
    product.block_order = [...new Set([...(product.block_order || []), 'trust_badges'])];
  }

  const cart = dc.templates?.cart?.sections?.cart_main;
  if (cart) {
    setDeep(cart.settings, 'subtitle', 'Review items before checkout');
    setDeep(cart.settings, 'shippingNote', 'Shipping calculated at checkout');
    setDeep(cart.settings, 'taxDisclaimer', 'Taxes may apply');
    cart.blocks = cart.blocks || {};
    cart.blocks.cart_summary = cart.blocks.cart_summary || { type: 'summary', blocks: {} };
    cart.blocks.cart_summary.blocks = cart.blocks.cart_summary.blocks || {};
    cart.blocks.cart_summary.blocks.checkout_button = { type: 'checkout', settings: { label: 'Checkout', helperText: 'Secure payment' } };
    cart.blocks.cart_summary.blocks.shipping_line = { type: 'shipping', settings: { label: 'Shipping', fallback: 'Calculated at checkout' } };
    cart.blocks.cart_summary.block_order = ['subtotal', 'shipping_line', 'checkout_button'];
  }

  const login = dc.templates?.login?.sections?.login_main;
  if (login) {
    setDeep(login.settings, 'backgroundStyle', 'split');
    setDeep(login.settings, 'sidePanelTitle', 'Welcome back');
    login.blocks = login.blocks || {};
    login.blocks.remember_me = { type: 'checkbox', settings: { label: 'Remember me' } };
    if (!login.block_order?.includes('remember_me')) {
      login.block_order = [...(login.block_order || []), 'remember_me'];
    }
  }

  const signup = dc.templates?.signup?.sections?.signup_main;
  if (signup) {
    setDeep(signup.settings, 'termsIntro', 'By creating an account you agree to our');
    signup.blocks = signup.blocks || {};
    signup.blocks.form_fields = signup.blocks.form_fields || { type: 'fields', blocks: {} };
    signup.blocks.form_fields.blocks = signup.blocks.form_fields.blocks || {};
    signup.blocks.form_fields.blocks.confirm_password_field = {
      type: 'password',
      settings: { placeholder: 'Confirm password', label: 'Confirm password' },
    };
    signup.blocks.terms_checkbox = {
      type: 'terms',
      settings: { label: 'I agree to the Terms of Service', href: '/terms' },
    };
    signup.block_order = [...new Set([...(signup.block_order || []), 'terms_checkbox'])];
  }

  const forgot = dc.templates?.forgot_password?.sections?.forgot_main;
  if (forgot) {
    forgot.blocks = forgot.blocks || {};
    forgot.blocks.resend_hint = { type: 'hint', settings: { text: 'Did not receive an email? Check spam or try again.' } };
    forgot.block_order = [...new Set([...(forgot.block_order || []), 'resend_hint'])];
  }

  const profile = dc.templates?.profile?.sections?.profile_main;
  if (profile) {
    setDeep(profile.settings, 'avatarSize', 72);
    profile.blocks = profile.blocks || {};
    profile.blocks.avatar = { type: 'avatar', settings: { initialsFallback: 'U', show: true } };
    profile.blocks.profile_form = profile.blocks.profile_form || { type: 'form', blocks: {} };
    profile.blocks.profile_form.blocks = profile.blocks.profile_form.blocks || {};
    profile.blocks.profile_form.blocks.address_section = {
      type: 'address',
      settings: { heading: 'Shipping address', helperText: 'Used for order delivery' },
    };
    profile.block_order = ['avatar', ...(profile.block_order || []).filter((id) => id !== 'avatar')];
  }

  const orders = dc.templates?.orders?.sections?.orders_main;
  if (orders) {
    orders.blocks = orders.blocks || {};
    orders.blocks.empty_state = orders.blocks.empty_state || { type: 'empty', settings: {} };
    setDeep(orders.blocks.empty_state.settings, 'ctaLabel', 'Start shopping');
    setDeep(orders.blocks.empty_state.settings, 'ctaHref', '/products');
    orders.blocks.order_card = orders.blocks.order_card || { type: 'card', blocks: {} };
    orders.blocks.order_card.blocks = orders.blocks.order_card.blocks || {};
    orders.blocks.order_card.blocks.order_number_line = { type: 'number', settings: { prefix: 'Order' } };
    orders.blocks.order_card.blocks.view_details = { type: 'link', settings: { label: 'View details' } };
    orders.blocks.order_card.blocks.items_count_line = { type: 'items', settings: { suffix: 'items' } };
    orders.blocks.order_card.block_order = [
      'order_number_line',
      'order_total_line',
      'status_line',
      'order_date_line',
      'items_count_line',
      'view_details',
    ];
  }

  const preferences = dc.templates?.preferences?.sections?.preferences_main;
  if (preferences) {
    preferences.blocks = preferences.blocks || {};
    preferences.blocks.privacy_options = {
      type: 'privacy',
      blocks: {
        cookies_toggle: { type: 'toggle', settings: { label: 'Functional cookies', description: 'Required for cart and login' } },
        analytics_toggle: { type: 'toggle', settings: { label: 'Analytics' } },
      },
      block_order: ['cookies_toggle', 'analytics_toggle'],
    };
    preferences.block_order = [...new Set([...(preferences.block_order || []), 'privacy_options'])];
  }

  return dc;
}

function enrichVoltSchema(schema) {
  const hero = sec(schema, 'index', 'split_hero');
  if (hero) {
    pushField(hero, field('templates.index.sections.split_hero.settings.kicker', 'text', 'Kicker'));
    pushField(hero, field('templates.index.sections.split_hero.settings.minHeight', 'number', 'Min height'));
    pushField(hero, field('templates.index.sections.split_hero.settings.invert', 'boolean', 'Invert columns'));
  }
  const marquee = sec(schema, 'index', 'marquee_strip');
  if (marquee) {
    pushField(marquee, field('templates.index.sections.marquee_strip.settings.repeat', 'number', 'Repeat count'));
    pushField(marquee, field('templates.index.sections.marquee_strip.settings.separator', 'text', 'Separator'));
  }
  const bento = sec(schema, 'index', 'bento_grid');
  if (bento) {
    pushField(bento, field('templates.index.sections.bento_grid.settings.density', 'select', 'Density', {
      options: [
        { value: 'tight', label: 'Tight' },
        { value: 'loose', label: 'Loose' },
      ],
    }));
  }

  const product = sec(schema, 'product', 'product_split');
  if (product) {
    pushField(product, field('templates.product.sections.product_split.settings.showShare', 'boolean', 'Show share row'));
    const gallery = findBlock(product, 'gallery_stack');
    if (gallery) {
      pushField(gallery, field('templates.product.sections.product_split.blocks.gallery_stack.settings.altFallback', 'text', 'Alt text fallback'));
      pushField(gallery, field('templates.product.sections.product_split.blocks.gallery_stack.settings.thumbCount', 'number', 'Thumbnail count'));
    }
    ensureBlock(product, {
      id: 'share_strip',
      label: 'Share',
      settingsFields: [
        field('templates.product.sections.product_split.blocks.share_strip.settings.label', 'text', 'Share label'),
        field('templates.product.sections.product_split.blocks.share_strip.settings.copyLabel', 'text', 'Copy link label'),
      ],
    });
    const rail = findBlock(product, 'purchase_rail');
    if (rail) {
      ensureBlock(rail, {
        id: 'stock_hint',
        label: 'Stock hint',
        settingsFields: [
          field('templates.product.sections.product_split.blocks.purchase_rail.blocks.stock_hint.settings.inStock', 'text', 'In stock text'),
          field('templates.product.sections.product_split.blocks.purchase_rail.blocks.stock_hint.settings.outOfStock', 'text', 'Out of stock text'),
        ],
      });
    }
  }

  const cart = sec(schema, 'cart', 'cart_drawer');
  if (cart) {
    pushField(cart, field('templates.cart.sections.cart_drawer.settings.promoHint', 'text', 'Promo hint'));
    const totals = findBlock(cart, 'totals_panel');
    if (totals) {
      ensureBlock(totals, {
        id: 'tax_row',
        label: 'Tax',
        settingsFields: [
          field('templates.cart.sections.cart_drawer.blocks.totals_panel.blocks.tax_row.settings.label', 'text', 'Label'),
        ],
      });
      ensureBlock(totals, {
        id: 'shipping_row',
        label: 'Shipping',
        settingsFields: [
          field('templates.cart.sections.cart_drawer.blocks.totals_panel.blocks.shipping_row.settings.label', 'text', 'Label'),
        ],
      });
    }
    ensureBlock(cart, {
      id: 'promo_field',
      label: 'Promo code',
      settingsFields: [
        field('templates.cart.sections.cart_drawer.blocks.promo_field.settings.placeholder', 'text', 'Placeholder'),
        field('templates.cart.sections.cart_drawer.blocks.promo_field.settings.applyLabel', 'text', 'Apply button'),
      ],
    });
  }

  const login = sec(schema, 'login', 'auth_gate');
  if (login) {
    ensureBlock(login, {
      id: 'remember_toggle',
      label: 'Remember me',
      settingsFields: [
        field('templates.login.sections.auth_gate.blocks.remember_toggle.settings.label', 'text', 'Label'),
      ],
    });
    pushField(login, field('templates.login.sections.auth_gate.settings.oauthDivider', 'text', 'OAuth divider text'));
  }

  const signup = sec(schema, 'signup', 'auth_register');
  if (signup) {
    const fields = findBlock(signup, 'identity_fields');
    if (fields) {
      ensureBlock(fields, {
        id: 'confirm_secret',
        label: 'Confirm password',
        settingsFields: [
          field('templates.signup.sections.auth_register.blocks.identity_fields.blocks.confirm_secret.settings.placeholder', 'text', 'Placeholder'),
        ],
      });
    }
    ensureBlock(signup, {
      id: 'legal_ack',
      label: 'Legal acknowledgment',
      settingsFields: [
        field('templates.signup.sections.auth_register.blocks.legal_ack.settings.label', 'text', 'Checkbox label'),
        field('templates.signup.sections.auth_register.blocks.legal_ack.settings.href', 'text', 'Terms URL'),
      ],
    });
  }

  const forgot = sec(schema, 'forgot_password', 'auth_recover');
  if (forgot) {
    pushField(findBlock(forgot, 'submit_pulse'), field('templates.forgot_password.sections.auth_recover.blocks.submit_pulse.settings.loadingLabel', 'text', 'Loading label'));
    const email = findBlock(findBlock(forgot, 'recover_field'), 'email_field');
    if (email) pushField(email, field('templates.forgot_password.sections.auth_recover.blocks.recover_field.blocks.email_field.settings.label', 'text', 'Field label'));
    ensureBlock(forgot, {
      id: 'spam_hint',
      label: 'Spam folder hint',
      settingsFields: [
        field('templates.forgot_password.sections.auth_recover.blocks.spam_hint.settings.text', 'text', 'Hint'),
      ],
    });
  }

  const profile = sec(schema, 'profile', 'account_hub');
  if (profile) {
    pushField(profile, field('templates.profile.sections.account_hub.settings.panelNote', 'text', 'Panel note'));
    ensureBlock(profile, {
      id: 'avatar_chip',
      label: 'Avatar',
      settingsFields: [
        field('templates.profile.sections.account_hub.blocks.avatar_chip.settings.show', 'boolean', 'Show avatar'),
        field('templates.profile.sections.account_hub.blocks.avatar_chip.settings.fallback', 'text', 'Fallback initials'),
      ],
    });
    const form = findBlock(profile, 'identity_form');
    if (form) {
      ensureBlock(form, {
        id: 'address_block',
        label: 'Address',
        settingsFields: [
          field('templates.profile.sections.account_hub.blocks.identity_form.blocks.address_block.settings.heading', 'text', 'Heading'),
          field('templates.profile.sections.account_hub.blocks.identity_form.blocks.address_block.settings.helper', 'text', 'Helper'),
        ],
      });
    }
    pushField(findBlock(profile, 'persist_action'), field('templates.profile.sections.account_hub.blocks.persist_action.settings.successLabel', 'text', 'Success label'));
  }

  const orders = sec(schema, 'orders', 'order_timeline');
  if (orders) {
    const card = findBlock(orders, 'timeline_card');
    if (card) {
      ensureBlock(card, {
        id: 'number_row',
        label: 'Order number',
        settingsFields: [
          field('templates.orders.sections.order_timeline.blocks.timeline_card.blocks.number_row.settings.prefix', 'text', 'Prefix'),
        ],
      });
      ensureBlock(card, {
        id: 'cta_row',
        label: 'View order',
        settingsFields: [
          field('templates.orders.sections.order_timeline.blocks.timeline_card.blocks.cta_row.settings.label', 'text', 'Link label'),
        ],
      });
      ensureBlock(card, {
        id: 'items_row',
        label: 'Items count',
        settingsFields: [
          field('templates.orders.sections.order_timeline.blocks.timeline_card.blocks.items_row.settings.suffix', 'text', 'Items suffix'),
        ],
      });
    }
    const empty = findBlock(orders, 'empty_pulse');
    if (empty) {
      pushField(empty, field('templates.orders.sections.order_timeline.blocks.empty_pulse.settings.ctaLabel', 'text', 'CTA label'));
      pushField(empty, field('templates.orders.sections.order_timeline.blocks.empty_pulse.settings.ctaHref', 'text', 'CTA URL'));
    }
  }

  const prefs = sec(schema, 'preferences', 'signal_prefs');
  if (prefs) {
    ensureBlock(prefs, {
      id: 'privacy_row',
      label: 'Privacy',
      blocks: [
        {
          id: 'cookie_cell',
          label: 'Cookies',
          settingsFields: [
            field('templates.preferences.sections.signal_prefs.blocks.privacy_row.blocks.cookie_cell.settings.label', 'text', 'Label'),
            field('templates.preferences.sections.signal_prefs.blocks.privacy_row.blocks.cookie_cell.settings.description', 'text', 'Description'),
          ],
        },
        {
          id: 'analytics_cell',
          label: 'Analytics',
          settingsFields: [
            field('templates.preferences.sections.signal_prefs.blocks.privacy_row.blocks.analytics_cell.settings.label', 'text', 'Label'),
          ],
        },
      ],
    });
    const channels = findBlock(prefs, 'channel_toggles');
    if (channels) {
      for (const bid of ['email_toggle', 'sms_toggle', 'locale_field']) {
        const b = findBlock(channels, bid);
        if (b) pushField(b, field(`templates.preferences.sections.signal_prefs.blocks.channel_toggles.blocks.${bid}.settings.description`, 'text', 'Description'));
      }
    }
  }

  return schema;
}

function enrichVoltDefaultConfig(dc) {
  const hero = dc.templates?.index?.sections?.split_hero;
  if (hero?.settings) {
    setDeep(hero.settings, 'kicker', 'VOLT / 2026');
    setDeep(hero.settings, 'minHeight', 640);
    setDeep(hero.settings, 'invert', false);
  }
  const product = dc.templates?.product?.sections?.product_split;
  if (product) {
    setDeep(product.settings, 'showShare', true);
    product.blocks = product.blocks || {};
    product.blocks.share_strip = { type: 'share', settings: { label: 'Share', copyLabel: 'Copy link' } };
    product.blocks.purchase_rail = product.blocks.purchase_rail || { type: 'rail', blocks: {} };
    product.blocks.purchase_rail.blocks = product.blocks.purchase_rail.blocks || {};
    product.blocks.purchase_rail.blocks.stock_hint = {
      type: 'stock',
      settings: { inStock: 'In stock', outOfStock: 'Sold out' },
    };
    product.block_order = [...new Set([...(product.block_order || []), 'share_strip'])];
  }
  const cart = dc.templates?.cart?.sections?.cart_drawer;
  if (cart) {
    setDeep(cart.settings, 'promoHint', 'Have a code?');
    cart.blocks = cart.blocks || {};
    cart.blocks.promo_field = { type: 'promo', settings: { placeholder: 'Promo code', applyLabel: 'Apply' } };
    cart.blocks.totals_panel = cart.blocks.totals_panel || { type: 'totals', blocks: {} };
    cart.blocks.totals_panel.blocks = cart.blocks.totals_panel.blocks || {};
    cart.blocks.totals_panel.blocks.tax_row = { type: 'tax', settings: { label: 'Tax' } };
    cart.blocks.totals_panel.blocks.shipping_row = { type: 'shipping', settings: { label: 'Shipping' } };
    cart.blocks.totals_panel.block_order = ['subtotal_row', 'shipping_row', 'tax_row', 'checkout_cta'];
    cart.block_order = [...new Set([...(cart.block_order || []), 'promo_field'])];
  }
  const login = dc.templates?.login?.sections?.auth_gate;
  if (login) {
    setDeep(login.settings, 'oauthDivider', 'or continue with');
    login.blocks = login.blocks || {};
    login.blocks.remember_toggle = { type: 'checkbox', settings: { label: 'Stay signed in' } };
    login.block_order = [...new Set([...(login.block_order || []), 'remember_toggle'])];
  }
  const forgot = dc.templates?.forgot_password?.sections?.auth_recover;
  if (forgot) {
    forgot.blocks = forgot.blocks || {};
    forgot.blocks.spam_hint = { type: 'hint', settings: { text: 'Check spam if the email does not arrive.' } };
    forgot.block_order = [...new Set([...(forgot.block_order || []), 'spam_hint'])];
  }
  const profile = dc.templates?.profile?.sections?.account_hub;
  if (profile) {
    setDeep(profile.settings, 'panelNote', 'Identity synced across devices');
    profile.blocks = profile.blocks || {};
    profile.blocks.avatar_chip = { type: 'avatar', settings: { show: true, fallback: 'V' } };
    profile.blocks.identity_form = profile.blocks.identity_form || { type: 'form', blocks: {} };
    profile.blocks.identity_form.blocks = profile.blocks.identity_form.blocks || {};
    profile.blocks.identity_form.blocks.address_block = {
      type: 'address',
      settings: { heading: 'Delivery address', helper: 'Used for fulfillment' },
    };
    profile.block_order = ['avatar_chip', ...(profile.block_order || []).filter((id) => id !== 'avatar_chip')];
  }
  const orders = dc.templates?.orders?.sections?.order_timeline;
  if (orders) {
    orders.blocks = orders.blocks || {};
    orders.blocks.empty_pulse = orders.blocks.empty_pulse || { type: 'empty', settings: {} };
    setDeep(orders.blocks.empty_pulse.settings, 'ctaLabel', 'Browse catalog');
    setDeep(orders.blocks.empty_pulse.settings, 'ctaHref', '/products');
    orders.blocks.timeline_card = orders.blocks.timeline_card || { type: 'card', blocks: {} };
    orders.blocks.timeline_card.blocks = orders.blocks.timeline_card.blocks || {};
    orders.blocks.timeline_card.blocks.number_row = { type: 'number', settings: { prefix: '#' } };
    orders.blocks.timeline_card.blocks.cta_row = { type: 'link', settings: { label: 'Open order' } };
    orders.blocks.timeline_card.blocks.items_row = { type: 'items', settings: { suffix: 'units' } };
    orders.blocks.timeline_card.block_order = [
      'number_row',
      'total_row',
      'status_row',
      'date_row',
      'items_row',
      'cta_row',
    ];
  }
  const preferences = dc.templates?.preferences?.sections?.signal_prefs;
  if (preferences) {
    preferences.blocks = preferences.blocks || {};
    preferences.blocks.privacy_row = {
      type: 'privacy',
      blocks: {
        cookie_cell: { type: 'toggle', settings: { label: 'Cookies', description: 'Required for session' } },
        analytics_cell: { type: 'toggle', settings: { label: 'Analytics' } },
      },
      block_order: ['cookie_cell', 'analytics_cell'],
    };
    preferences.block_order = [...new Set([...(preferences.block_order || []), 'privacy_row'])];
  }
  return dc;
}

function replaceIndexSectionPaths(str, sectionId) {
  return str.replace(/product_showcase/g, sectionId);
}

function countFields(obj) {
  let n = 0;
  const walk = (x) => {
    if (!x || typeof x !== 'object') return;
    if (Array.isArray(x.settingsFields)) n += x.settingsFields.length;
    if (Array.isArray(x.blocks)) x.blocks.forEach(walk);
    if (Array.isArray(x.sections)) x.sections.forEach(walk);
  };
  obj.globalSettings?.groups?.forEach((g) => {
    if (g.fields) n += g.fields.length;
  });
  Object.values(obj.layout || {}).forEach(walk);
  obj.templates?.forEach((t) => walk(t));
  return n;
}

// --- Standard packs from bloom base ---
const bloomSchema = readJson(path.join(PACKS, 'bloom', 'theme.schema.json'));
const bloomDc = readJson(path.join(PACKS, 'bloom', 'theme.default-config.json'));

for (const [pack, indexSection, indexLabel] of [
  ['bloom', 'product_showcase', 'Product showcase'],
  ['horizon', 'featured_collection', 'Featured collection'],
  ['studio', 'product_grid', 'Product grid'],
]) {
  let schema = JSON.parse(JSON.stringify(bloomSchema));
  let dc = JSON.parse(JSON.stringify(bloomDc));
  schema.themeId = pack;
  dc.themeId = pack;
  if (pack !== 'bloom') {
    schema = JSON.parse(replaceIndexSectionPaths(JSON.stringify(schema), indexSection));
    dc = JSON.parse(replaceIndexSectionPaths(JSON.stringify(dc), indexSection));
    const sec = schema.templates.find((t) => t.id === 'index')?.sections?.find((s) => s.id === indexSection);
    if (sec) sec.label = indexLabel;
    const order = dc.templates?.index?.section_order;
    if (order) {
      dc.templates.index.section_order = order.map((id) => (id === 'product_showcase' ? indexSection : id));
    }
  }
  schema = enrichStandardSchema(schema, indexSection);
  dc = enrichStandardDefaultConfig(dc, indexSection);
  writeJson(path.join(PACKS, pack, 'theme.schema.json'), schema);
  writeJson(path.join(PACKS, pack, 'theme.default-config.json'), dc);
  console.log(pack, '→', countFields(schema), 'schema fields');
}

// --- Volt ---
const voltSchemaPath = path.join(PACKS, 'volt', 'theme.schema.json');
const voltDcPath = path.join(PACKS, 'volt', 'theme.default-config.json');
let voltSchema = readJson(voltSchemaPath);
let voltDc = readJson(voltDcPath);
voltSchema = enrichVoltSchema(voltSchema);
voltDc = enrichVoltDefaultConfig(voltDc);
writeJson(voltSchemaPath, voltSchema);
writeJson(voltDcPath, voltDc);
console.log('volt →', countFields(voltSchema), 'schema fields');

// --- Ziplofy3b mirror ---
for (const pack of ['bloom', 'horizon', 'studio', 'volt']) {
  for (const file of ['theme.schema.json', 'theme.default-config.json']) {
    const src = path.join(PACKS, pack, file);
    const dest = path.join(B3, pack, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}
console.log('Synced Ziplofy3b theme packs');
