/**
 * Generates Volt theme pack — schema-rich + structurally different section/block ids.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function field(path, type, label, extra = {}) {
  return { path, type, label, ...extra };
}

function block(id, label, settingsFields = [], blocks = []) {
  const b = { id, label };
  if (settingsFields.length) b.settingsFields = settingsFields;
  if (blocks.length) b.blocks = blocks;
  return b;
}

function section(id, type, label, settingsFields = [], blocks = []) {
  return { id, type, label, hasBlocks: true, settingsFields, blocks };
}

const schema = {
  version: '1.0.0',
  themeId: 'volt',
  description: 'Volt theme editor tree — brutalist layout, unique section ids, maximum nesting for editor QA',
  globalSettings: {
    label: 'Theme settings',
    groups: [
      {
        id: 'colors',
        label: 'Colors',
        fields: [
          field('settings.colors.primary', 'color', 'Neon accent'),
          field('settings.colors.secondary', 'color', 'Secondary accent'),
          field('settings.colors.background', 'color', 'Background'),
          field('settings.colors.surface', 'color', 'Surface'),
          field('settings.colors.text', 'color', 'Text'),
          field('settings.colors.muted', 'color', 'Muted text'),
        ],
      },
      {
        id: 'typography',
        label: 'Typography',
        fields: [
          field('settings.typography.fontDisplay', 'text', 'Display font'),
          field('settings.typography.fontMono', 'text', 'Mono font'),
          field('settings.typography.fontBody', 'text', 'Body font'),
          field('settings.typography.baseSize', 'number', 'Base font size (px)'),
        ],
      },
      {
        id: 'chrome',
        label: 'Chrome & shape',
        fields: [
          field('settings.chrome.borderRadius', 'number', 'Corner radius (px)'),
          field('settings.chrome.borderWidth', 'number', 'Border width (px)'),
          field('settings.chrome.density', 'text', 'Layout density (compact | comfortable | airy)'),
        ],
      },
    ],
  },
  layout: {
    announcement_bar: {
      label: 'Ticker bar',
      settingsFields: [
        field('sections.announcement_bar.settings.enabled', 'boolean', 'Show ticker'),
        field('sections.announcement_bar.settings.message', 'text', 'Ticker text'),
        field('sections.announcement_bar.settings.linkLabel', 'text', 'Link label'),
        field('sections.announcement_bar.settings.linkHref', 'text', 'Link URL'),
        field('sections.announcement_bar.settings.speed', 'number', 'Scroll speed'),
      ],
    },
    header: {
      label: 'Command header',
      settingsFields: [field('sections.header.settings.sticky', 'boolean', 'Sticky header')],
      blocks: [
        block('brand_mark', 'Brand mark', [
          field('sections.header.blocks.brand_mark.settings.monogram', 'text', 'Monogram'),
          field('sections.header.blocks.brand_mark.settings.wordmark', 'text', 'Wordmark'),
          field('sections.header.blocks.brand_mark.settings.tagline', 'text', 'Tagline'),
        ]),
        block('nav_rail', 'Navigation rail', [], [
          block('link_catalog', 'Catalog', [
            field('sections.header.blocks.nav_rail.settings.items.0.label', 'text', 'Label'),
            field('sections.header.blocks.nav_rail.settings.items.0.href', 'text', 'Link'),
          ]),
          block('link_lab', 'Lab', [
            field('sections.header.blocks.nav_rail.settings.items.1.label', 'text', 'Label'),
            field('sections.header.blocks.nav_rail.settings.items.1.href', 'text', 'Link'),
          ]),
          block('link_support', 'Support', [
            field('sections.header.blocks.nav_rail.settings.items.2.label', 'text', 'Label'),
            field('sections.header.blocks.nav_rail.settings.items.2.href', 'text', 'Link'),
          ]),
        ]),
        block('action_cluster', 'Actions', [
          field('sections.header.blocks.action_cluster.settings.searchPlaceholder', 'text', 'Search placeholder'),
          field('sections.header.blocks.action_cluster.settings.cartLabel', 'text', 'Cart label'),
          field('sections.header.blocks.action_cluster.settings.accountLabel', 'text', 'Account label'),
        ]),
      ],
    },
    footer: {
      label: 'Terminal footer',
      blocks: [
        block('brand_terminal', 'Brand terminal', [
          field('sections.footer.blocks.brand_terminal.settings.headline', 'text', 'Headline'),
          field('sections.footer.blocks.brand_terminal.settings.blurb', 'textarea', 'Blurb'),
        ]),
        block('link_matrix', 'Link matrix', [], [
          block('col_shop', 'Shop column', [
            field('sections.footer.blocks.link_matrix.blocks.col_shop.settings.title', 'text', 'Column title'),
            field('sections.footer.blocks.link_matrix.blocks.col_shop.settings.link1Label', 'text', 'Link 1'),
            field('sections.footer.blocks.link_matrix.blocks.col_shop.settings.link1Href', 'text', 'URL 1'),
          ]),
          block('col_info', 'Info column', [
            field('sections.footer.blocks.link_matrix.blocks.col_info.settings.title', 'text', 'Column title'),
            field('sections.footer.blocks.link_matrix.blocks.col_info.settings.link1Label', 'text', 'Link 1'),
            field('sections.footer.blocks.link_matrix.blocks.col_info.settings.link1Href', 'text', 'URL 1'),
          ]),
        ]),
        block('signal_capture', 'Newsletter capture', [
          field('sections.footer.blocks.signal_capture.settings.title', 'text', 'Heading'),
          field('sections.footer.blocks.signal_capture.settings.placeholder', 'text', 'Input placeholder'),
          field('sections.footer.blocks.signal_capture.settings.buttonLabel', 'text', 'Button'),
        ]),
      ],
    },
    footer_utilities: {
      label: 'Footer utilities',
      blocks: [
        block('copyright', 'Copyright', [field('sections.footer_utilities.blocks.copyright.settings.text', 'text', 'Copyright')]),
        block('policy_links', 'Policies', [
          field('sections.footer_utilities.blocks.policy_links.settings.privacyLabel', 'text', 'Privacy'),
          field('sections.footer_utilities.blocks.policy_links.settings.privacyHref', 'text', 'Privacy URL'),
          field('sections.footer_utilities.blocks.policy_links.settings.termsLabel', 'text', 'Terms'),
          field('sections.footer_utilities.blocks.policy_links.settings.termsHref', 'text', 'Terms URL'),
        ]),
        block('social', 'Social', [
          field('sections.footer_utilities.blocks.social.settings.instagram', 'text', 'Instagram'),
          field('sections.footer_utilities.blocks.social.settings.discord', 'text', 'Discord'),
        ]),
      ],
    },
  },
  templates: [
    {
      id: 'index',
      label: 'Home page',
      sections: [
        section('split_hero', 'split-hero', 'Split hero', [
          field('templates.index.sections.split_hero.settings.kicker', 'text', 'Kicker'),
          field('templates.index.sections.split_hero.settings.headline', 'text', 'Headline'),
          field('templates.index.sections.split_hero.settings.subcopy', 'textarea', 'Subcopy'),
          field('templates.index.sections.split_hero.settings.panelLabel', 'text', 'Visual panel label'),
        ], [
          block('badge_chip', 'Badge', [field('templates.index.sections.split_hero.blocks.badge_chip.settings.text', 'text', 'Badge text')]),
          block('cta_primary', 'Primary CTA', [
            field('templates.index.sections.split_hero.blocks.cta_primary.settings.label', 'text', 'Label'),
            field('templates.index.sections.split_hero.blocks.cta_primary.settings.href', 'text', 'Link'),
          ]),
          block('cta_secondary', 'Secondary CTA', [
            field('templates.index.sections.split_hero.blocks.cta_secondary.settings.label', 'text', 'Label'),
            field('templates.index.sections.split_hero.blocks.cta_secondary.settings.href', 'text', 'Link'),
          ]),
        ]),
        section('marquee_strip', 'marquee', 'Marquee strip', [
          field('templates.index.sections.marquee_strip.settings.enabled', 'boolean', 'Enabled'),
          field('templates.index.sections.marquee_strip.settings.repeat', 'number', 'Repeat count'),
        ], [
          block('track_a', 'Track phrase A', [field('templates.index.sections.marquee_strip.blocks.track_a.settings.phrase', 'text', 'Phrase')]),
          block('track_b', 'Track phrase B', [field('templates.index.sections.marquee_strip.blocks.track_b.settings.phrase', 'text', 'Phrase')]),
        ]),
        section('bento_grid', 'bento', 'Bento grid', [
          field('templates.index.sections.bento_grid.settings.sectionTitle', 'text', 'Section title'),
          field('templates.index.sections.bento_grid.settings.productsToShow', 'number', 'Products to show'),
        ], [
          block('tile_hero', 'Hero tile', [
            field('templates.index.sections.bento_grid.blocks.tile_hero.settings.title', 'text', 'Title'),
            field('templates.index.sections.bento_grid.blocks.tile_hero.settings.href', 'text', 'Link'),
          ]),
          block('tile_signal', 'Signal tile', [
            field('templates.index.sections.bento_grid.blocks.tile_signal.settings.label', 'text', 'Label'),
            field('templates.index.sections.bento_grid.blocks.tile_signal.settings.stat', 'text', 'Stat'),
          ]),
          block('tile_drop', 'Drop tile', [
            field('templates.index.sections.bento_grid.blocks.tile_drop.settings.title', 'text', 'Title'),
            field('templates.index.sections.bento_grid.blocks.tile_drop.settings.caption', 'text', 'Caption'),
          ]),
          block('product_tile', 'Product tile', [], [
            block('tile_media', 'Media', [field('templates.index.sections.bento_grid.blocks.product_tile.settings.showMedia', 'boolean', 'Show media')]),
            block('tile_title', 'Title', [field('templates.index.sections.bento_grid.blocks.product_tile.settings.showTitle', 'boolean', 'Show title')]),
            block('tile_price', 'Price', [field('templates.index.sections.bento_grid.blocks.product_tile.settings.showPrice', 'boolean', 'Show price')]),
          ]),
        ]),
        section('proof_strip', 'proof', 'Proof strip', [
          field('templates.index.sections.proof_strip.settings.title', 'text', 'Strip title'),
        ], [
          block('stat_one', 'Stat 1', [
            field('templates.index.sections.proof_strip.blocks.stat_one.settings.value', 'text', 'Value'),
            field('templates.index.sections.proof_strip.blocks.stat_one.settings.label', 'text', 'Label'),
          ]),
          block('stat_two', 'Stat 2', [
            field('templates.index.sections.proof_strip.blocks.stat_two.settings.value', 'text', 'Value'),
            field('templates.index.sections.proof_strip.blocks.stat_two.settings.label', 'text', 'Label'),
          ]),
          block('stat_three', 'Stat 3', [
            field('templates.index.sections.proof_strip.blocks.stat_three.settings.value', 'text', 'Value'),
            field('templates.index.sections.proof_strip.blocks.stat_three.settings.label', 'text', 'Label'),
          ]),
        ]),
      ],
    },
    {
      id: 'product',
      label: 'Product page',
      sections: [
        section('product_split', 'product-split', 'Split product', [], [
          block('gallery_stack', 'Gallery', [field('templates.product.sections.product_split.blocks.gallery_stack.settings.showImage', 'boolean', 'Show image')]),
          block('info_stack', 'Info stack', [], [
            block('vendor_tag', 'Vendor', [
              field('templates.product.sections.product_split.blocks.info_stack.blocks.vendor_tag.settings.prefix', 'text', 'Prefix'),
              field('templates.product.sections.product_split.blocks.info_stack.blocks.vendor_tag.settings.showVendor', 'boolean', 'Show vendor'),
            ]),
            block('title_block', 'Title', [field('templates.product.sections.product_split.blocks.info_stack.blocks.title_block.settings.loadingLabel', 'text', 'Loading label')]),
            block('desc_block', 'Description', [field('templates.product.sections.product_split.blocks.info_stack.blocks.desc_block.settings.showDescription', 'boolean', 'Show description')]),
            block('price_block', 'Price', [field('templates.product.sections.product_split.blocks.info_stack.blocks.price_block.settings.fallback', 'text', 'Empty price')]),
          ]),
          block('purchase_rail', 'Purchase rail', [], [
            block('qty_hint', 'Quantity hint', [field('templates.product.sections.product_split.blocks.purchase_rail.blocks.qty_hint.settings.label', 'text', 'Qty label')]),
            block('add_button', 'Add button', [
              field('templates.product.sections.product_split.blocks.purchase_rail.blocks.add_button.settings.label', 'text', 'Button'),
              field('templates.product.sections.product_split.blocks.purchase_rail.blocks.add_button.settings.addingLabel', 'text', 'Adding label'),
            ]),
          ]),
        ]),
      ],
    },
    {
      id: 'cart',
      label: 'Cart',
      sections: [
        section('cart_drawer', 'cart-drawer', 'Cart drawer', [
          field('templates.cart.sections.cart_drawer.settings.title', 'text', 'Title'),
          field('templates.cart.sections.cart_drawer.settings.subtitle', 'text', 'Subtitle'),
        ], [
          block('empty_state', 'Empty', [], [
            block('empty_copy', 'Copy', [field('templates.cart.sections.cart_drawer.blocks.empty_state.blocks.empty_copy.settings.title', 'text', 'Title')]),
            block('empty_cta', 'CTA', [
              field('templates.cart.sections.cart_drawer.blocks.empty_state.blocks.empty_cta.settings.label', 'text', 'Label'),
              field('templates.cart.sections.cart_drawer.blocks.empty_state.blocks.empty_cta.settings.href', 'text', 'Link'),
            ]),
          ]),
          block('line_list', 'Lines', [], [
            block('line_actions', 'Actions', [
              field('templates.cart.sections.cart_drawer.blocks.line_list.blocks.line_actions.settings.removeLabel', 'text', 'Remove'),
              field('templates.cart.sections.cart_drawer.blocks.line_list.blocks.line_actions.settings.qtyLabel', 'text', 'Qty label'),
            ]),
          ]),
          block('totals_panel', 'Totals', [], [
            block('subtotal_row', 'Subtotal', [field('templates.cart.sections.cart_drawer.blocks.totals_panel.blocks.subtotal_row.settings.label', 'text', 'Label')]),
            block('checkout_cta', 'Checkout', [field('templates.cart.sections.cart_drawer.blocks.totals_panel.blocks.checkout_cta.settings.label', 'text', 'Checkout label')]),
          ]),
        ]),
      ],
    },
    {
      id: 'login',
      label: 'Login',
      sections: [
        section('auth_gate', 'auth-gate', 'Auth gate', [
          field('templates.login.sections.auth_gate.settings.panelTitle', 'text', 'Panel title'),
          field('templates.login.sections.auth_gate.settings.panelSubtitle', 'textarea', 'Panel subtitle'),
          field('templates.login.sections.auth_gate.settings.sideCaption', 'text', 'Side panel caption'),
        ], [
          block('credential_fields', 'Fields', [], [
            block('email_field', 'Email', [field('templates.login.sections.auth_gate.blocks.credential_fields.blocks.email_field.settings.placeholder', 'text', 'Placeholder')]),
            block('password_field', 'Password', [field('templates.login.sections.auth_gate.blocks.credential_fields.blocks.password_field.settings.placeholder', 'text', 'Placeholder')]),
          ]),
          block('submit_pulse', 'Submit', [
            field('templates.login.sections.auth_gate.blocks.submit_pulse.settings.label', 'text', 'Label'),
            field('templates.login.sections.auth_gate.blocks.submit_pulse.settings.loadingLabel', 'text', 'Loading'),
          ]),
          block('forgot_link', 'Forgot', [
            field('templates.login.sections.auth_gate.blocks.forgot_link.settings.label', 'text', 'Label'),
            field('templates.login.sections.auth_gate.blocks.forgot_link.settings.href', 'text', 'URL'),
          ]),
          block('alt_route', 'Sign up route', [], [
            block('alt_prompt', 'Prompt', [field('templates.login.sections.auth_gate.blocks.alt_route.blocks.alt_prompt.settings.text', 'text', 'Text')]),
            block('alt_anchor', 'Link', [
              field('templates.login.sections.auth_gate.blocks.alt_route.blocks.alt_anchor.settings.label', 'text', 'Label'),
              field('templates.login.sections.auth_gate.blocks.alt_route.blocks.alt_anchor.settings.href', 'text', 'URL'),
            ]),
          ]),
        ]),
      ],
    },
    {
      id: 'signup',
      label: 'Sign up',
      sections: [
        section('auth_register', 'auth-register', 'Register', [
          field('templates.signup.sections.auth_register.settings.panelTitle', 'text', 'Panel title'),
          field('templates.signup.sections.auth_register.settings.panelSubtitle', 'textarea', 'Subtitle'),
        ], [
          block('identity_fields', 'Identity', [], [
            block('first_field', 'First name', [field('templates.signup.sections.auth_register.blocks.identity_fields.blocks.first_field.settings.placeholder', 'text', 'Placeholder')]),
            block('last_field', 'Last name', [field('templates.signup.sections.auth_register.blocks.identity_fields.blocks.last_field.settings.placeholder', 'text', 'Placeholder')]),
            block('email_field', 'Email', [field('templates.signup.sections.auth_register.blocks.identity_fields.blocks.email_field.settings.placeholder', 'text', 'Placeholder')]),
            block('password_field', 'Password', [field('templates.signup.sections.auth_register.blocks.identity_fields.blocks.password_field.settings.placeholder', 'text', 'Placeholder')]),
          ]),
          block('submit_pulse', 'Submit', [
            field('templates.signup.sections.auth_register.blocks.submit_pulse.settings.label', 'text', 'Label'),
            field('templates.signup.sections.auth_register.blocks.submit_pulse.settings.loadingLabel', 'text', 'Loading'),
          ]),
          block('alt_route', 'Login route', [], [
            block('alt_prompt', 'Prompt', [field('templates.signup.sections.auth_register.blocks.alt_route.blocks.alt_prompt.settings.text', 'text', 'Text')]),
            block('alt_anchor', 'Link', [
              field('templates.signup.sections.auth_register.blocks.alt_route.blocks.alt_anchor.settings.label', 'text', 'Label'),
              field('templates.signup.sections.auth_register.blocks.alt_route.blocks.alt_anchor.settings.href', 'text', 'URL'),
            ]),
          ]),
        ]),
      ],
    },
    {
      id: 'forgot_password',
      label: 'Forgot password',
      sections: [
        section('auth_recover', 'auth-recover', 'Recover', [
          field('templates.forgot_password.sections.auth_recover.settings.panelTitle', 'text', 'Title'),
          field('templates.forgot_password.sections.auth_recover.settings.panelSubtitle', 'textarea', 'Subtitle'),
        ], [
          block('recover_field', 'Email', [], [
            block('email_field', 'Email input', [field('templates.forgot_password.sections.auth_recover.blocks.recover_field.blocks.email_field.settings.placeholder', 'text', 'Placeholder')]),
          ]),
          block('submit_pulse', 'Submit', [field('templates.forgot_password.sections.auth_recover.blocks.submit_pulse.settings.label', 'text', 'Label')]),
          block('success_flash', 'Success', [field('templates.forgot_password.sections.auth_recover.blocks.success_flash.settings.text', 'text', 'Message')]),
          block('back_route', 'Back', [], [
            block('back_anchor', 'Link', [
              field('templates.forgot_password.sections.auth_recover.blocks.back_route.blocks.back_anchor.settings.label', 'text', 'Label'),
              field('templates.forgot_password.sections.auth_recover.blocks.back_route.blocks.back_anchor.settings.href', 'text', 'URL'),
            ]),
          ]),
        ]),
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      sections: [
        section('account_hub', 'account-hub', 'Account hub', [
          field('templates.profile.sections.account_hub.settings.title', 'text', 'Title'),
          field('templates.profile.sections.account_hub.settings.subtitle', 'textarea', 'Subtitle'),
        ], [
          block('signed_out_gate', 'Signed out', [], [
            block('gate_message', 'Message', [field('templates.profile.sections.account_hub.blocks.signed_out_gate.blocks.gate_message.settings.text', 'text', 'Message')]),
            block('gate_button', 'Button', [field('templates.profile.sections.account_hub.blocks.signed_out_gate.blocks.gate_button.settings.label', 'text', 'Label')]),
          ]),
          block('identity_form', 'Form', [], [
            block('email_readout', 'Email', [
              field('templates.profile.sections.account_hub.blocks.identity_form.blocks.email_readout.settings.label', 'text', 'Label'),
              field('templates.profile.sections.account_hub.blocks.identity_form.blocks.email_readout.settings.hint', 'text', 'Hint'),
            ]),
            block('first_field', 'First', [field('templates.profile.sections.account_hub.blocks.identity_form.blocks.first_field.settings.placeholder', 'text', 'Placeholder')]),
            block('last_field', 'Last', [field('templates.profile.sections.account_hub.blocks.identity_form.blocks.last_field.settings.placeholder', 'text', 'Placeholder')]),
            block('phone_field', 'Phone', [field('templates.profile.sections.account_hub.blocks.identity_form.blocks.phone_field.settings.placeholder', 'text', 'Placeholder')]),
          ]),
          block('persist_action', 'Save', [
            field('templates.profile.sections.account_hub.blocks.persist_action.settings.label', 'text', 'Label'),
            field('templates.profile.sections.account_hub.blocks.persist_action.settings.savingLabel', 'text', 'Saving'),
          ]),
        ]),
      ],
    },
    {
      id: 'orders',
      label: 'Orders',
      sections: [
        section('order_timeline', 'order-timeline', 'Order timeline', [
          field('templates.orders.sections.order_timeline.settings.title', 'text', 'Title'),
          field('templates.orders.sections.order_timeline.settings.subtitle', 'textarea', 'Subtitle'),
        ], [
          block('loading_pulse', 'Loading', [field('templates.orders.sections.order_timeline.blocks.loading_pulse.settings.message', 'text', 'Message')]),
          block('empty_pulse', 'Empty', [field('templates.orders.sections.order_timeline.blocks.empty_pulse.settings.message', 'text', 'Message')]),
          block('timeline_card', 'Card', [], [
            block('total_row', 'Total', [field('templates.orders.sections.order_timeline.blocks.timeline_card.blocks.total_row.settings.label', 'text', 'Label')]),
            block('date_row', 'Date', [field('templates.orders.sections.order_timeline.blocks.timeline_card.blocks.date_row.settings.prefix', 'text', 'Prefix')]),
            block('status_row', 'Status', [field('templates.orders.sections.order_timeline.blocks.timeline_card.blocks.status_row.settings.prefix', 'text', 'Prefix')]),
          ]),
        ]),
      ],
    },
    {
      id: 'preferences',
      label: 'Preferences',
      sections: [
        section('signal_prefs', 'signal-prefs', 'Signal preferences', [
          field('templates.preferences.sections.signal_prefs.settings.title', 'text', 'Title'),
          field('templates.preferences.sections.signal_prefs.settings.subtitle', 'textarea', 'Subtitle'),
        ], [
          block('signed_out_gate', 'Signed out', [field('templates.preferences.sections.signal_prefs.blocks.signed_out_gate.settings.message', 'text', 'Message')]),
          block('channel_toggles', 'Channels', [], [
            block('email_toggle', 'Email', [field('templates.preferences.sections.signal_prefs.blocks.channel_toggles.blocks.email_toggle.settings.label', 'text', 'Label')]),
            block('sms_toggle', 'SMS', [field('templates.preferences.sections.signal_prefs.blocks.channel_toggles.blocks.sms_toggle.settings.label', 'text', 'Label')]),
            block('locale_select', 'Locale', [field('templates.preferences.sections.signal_prefs.blocks.channel_toggles.blocks.locale_select.settings.label', 'text', 'Label')]),
          ]),
          block('persist_action', 'Save', [
            field('templates.preferences.sections.signal_prefs.blocks.persist_action.settings.label', 'text', 'Label'),
            field('templates.preferences.sections.signal_prefs.blocks.persist_action.settings.savingLabel', 'text', 'Saving'),
          ]),
        ]),
      ],
    },
  ],
};

function countFields(obj) {
  let n = 0;
  const walk = (x) => {
    if (!x || typeof x !== 'object') return;
    if (Array.isArray(x.settingsFields)) n += x.settingsFields.length;
    if (Array.isArray(x.blocks)) x.blocks.forEach(walk);
    if (Array.isArray(x.sections)) x.sections.forEach(walk);
  };
  schema.globalSettings.groups.forEach((g) => (n += g.fields.length));
  Object.values(schema.layout).forEach(walk);
  schema.templates.forEach((t) => walk(t));
  return n;
}

// Build default-config skeleton from schema paths (minimal viable structure)
const defaultConfig = {
  version: '1.0.0',
  themeId: 'volt',
  themeName: 'Volt',
  settings: {
    colors: {
      primary: '#c8ff00',
      secondary: '#ff3d81',
      background: '#0a0a0b',
      surface: '#141416',
      text: '#f4f4f5',
      muted: '#a1a1aa',
    },
    typography: {
      fontDisplay: "'Syne', system-ui, sans-serif",
      fontMono: "'IBM Plex Mono', monospace",
      fontBody: "'Inter', system-ui, sans-serif",
      baseSize: 16,
    },
    chrome: { borderRadius: 4, borderWidth: 2, density: 'comfortable' },
  },
  sections: {
    announcement_bar: {
      id: 'announcement_bar',
      type: 'announcement-bar',
      enabled: true,
      settings: {
        enabled: true,
        message: 'VOLT — Limited signal drop live now',
        linkLabel: 'Enter',
        linkHref: '/products',
        speed: 28,
      },
    },
    header: {
      id: 'header',
      type: 'header',
      enabled: true,
      settings: { sticky: true },
      blocks: {
        brand_mark: {
          type: 'brand-mark',
          settings: { monogram: 'V', wordmark: 'VOLT', tagline: 'High-voltage commerce' },
        },
        nav_rail: {
          type: 'nav-rail',
          settings: {
            items: [
              { label: 'Catalog', href: '/products' },
              { label: 'Lab', href: '/collection' },
              { label: 'Support', href: '/#support' },
            ],
          },
          nested_block_order: ['link_catalog', 'link_lab', 'link_support'],
        },
        action_cluster: {
          type: 'action-cluster',
          settings: {
            searchPlaceholder: 'Search SKUs…',
            cartLabel: 'Bag',
            accountLabel: 'ID',
          },
        },
      },
      block_order: ['brand_mark', 'nav_rail', 'action_cluster'],
    },
    footer: {
      id: 'footer',
      type: 'footer',
      enabled: true,
      blocks: {
        brand_terminal: {
          type: 'brand-terminal',
          settings: {
            headline: 'VOLT SYSTEMS',
            blurb: 'Experimental storefront interface for stress-testing theme editors.',
          },
        },
        link_matrix: {
          type: 'link-matrix',
          blocks: {
            col_shop: {
              type: 'column',
              settings: { title: 'Shop', link1Label: 'All products', link1Href: '/products' },
            },
            col_info: {
              type: 'column',
              settings: { title: 'Info', link1Label: 'About', link1Href: '/#about' },
            },
          },
          block_order: ['col_shop', 'col_info'],
        },
        signal_capture: {
          type: 'signal-capture',
          settings: {
            title: 'Join the signal list',
            placeholder: 'you@domain.io',
            buttonLabel: 'Transmit',
          },
        },
      },
      block_order: ['brand_terminal', 'link_matrix', 'signal_capture'],
    },
    footer_utilities: {
      id: 'footer_utilities',
      type: 'footer-utilities',
      enabled: true,
      blocks: {
        copyright: { type: 'copyright', settings: { text: '© 2026 VOLT' } },
        policy_links: {
          type: 'policy',
          settings: {
            privacyLabel: 'Privacy',
            privacyHref: '/pages/privacy',
            termsLabel: 'Terms',
            termsHref: '/pages/terms',
          },
        },
        social: {
          type: 'social',
          settings: { instagram: 'https://instagram.com', discord: 'https://discord.com' },
        },
      },
      block_order: ['copyright', 'policy_links', 'social'],
    },
  },
  templates: {
    index: {
      name: 'Home',
      sections: {
        split_hero: {
          type: 'split-hero',
          enabled: true,
          settings: {
            kicker: 'Signal 01',
            headline: 'Power your catalog with voltage',
            subcopy: 'A brutalist test theme — asymmetric grids, mono type, neon chrome.',
            panelLabel: 'LIVE PREVIEW PANEL',
          },
          blocks: {
            badge_chip: { type: 'badge', settings: { text: 'NEW DROP' } },
            cta_primary: { type: 'cta', settings: { label: 'Shop catalog', href: '/products' } },
            cta_secondary: { type: 'cta', settings: { label: 'Read manifesto', href: '/#about' } },
          },
          block_order: ['badge_chip', 'cta_primary', 'cta_secondary'],
        },
        marquee_strip: {
          type: 'marquee',
          enabled: true,
          settings: { enabled: true, repeat: 4 },
          blocks: {
            track_a: { type: 'track', settings: { phrase: 'FREE RETURNS' } },
            track_b: { type: 'track', settings: { phrase: 'SAME-DAY DISPATCH' } },
          },
          block_order: ['track_a', 'track_b'],
        },
        bento_grid: {
          type: 'bento',
          enabled: true,
          settings: { sectionTitle: 'Featured grid', productsToShow: 6 },
          blocks: {
            tile_hero: { type: 'tile', settings: { title: 'Core collection', href: '/products' } },
            tile_signal: { type: 'tile', settings: { label: 'Ship time', stat: '24h' } },
            tile_drop: { type: 'tile', settings: { title: 'Lab drop', caption: 'Weekly release' } },
            product_tile: {
              type: 'product-tile',
              settings: { showMedia: true, showTitle: true, showPrice: true },
              nested_block_order: ['tile_media', 'tile_title', 'tile_price'],
            },
          },
          block_order: ['tile_hero', 'tile_signal', 'tile_drop', 'product_tile'],
        },
        proof_strip: {
          type: 'proof',
          enabled: true,
          settings: { title: 'Proof metrics' },
          blocks: {
            stat_one: { type: 'stat', settings: { value: '12k+', label: 'Orders' } },
            stat_two: { type: 'stat', settings: { value: '4.9', label: 'Rating' } },
            stat_three: { type: 'stat', settings: { value: '48', label: 'Countries' } },
          },
          block_order: ['stat_one', 'stat_two', 'stat_three'],
        },
      },
      section_order: ['split_hero', 'marquee_strip', 'bento_grid', 'proof_strip'],
    },
    product: {
      name: 'Product',
      sections: {
        product_split: {
          type: 'product-split',
          enabled: true,
          settings: {},
          blocks: {
            gallery_stack: { type: 'gallery', settings: { showImage: true } },
            info_stack: {
              type: 'info',
              blocks: {
                vendor_tag: { type: 'vendor', settings: { prefix: 'Source', showVendor: true } },
                title_block: { type: 'title', settings: { loadingLabel: 'Loading…' } },
                desc_block: { type: 'desc', settings: { showDescription: true } },
                price_block: { type: 'price', settings: { fallback: '—' } },
              },
              block_order: ['vendor_tag', 'title_block', 'desc_block', 'price_block'],
            },
            purchase_rail: {
              type: 'purchase',
              blocks: {
                qty_hint: { type: 'qty', settings: { label: 'Qty' } },
                add_button: { type: 'add', settings: { label: 'Add to bag', addingLabel: 'Adding…' } },
              },
              block_order: ['qty_hint', 'add_button'],
            },
          },
          block_order: ['gallery_stack', 'info_stack', 'purchase_rail'],
        },
      },
      section_order: ['product_split'],
    },
    cart: {
      name: 'Cart',
      sections: {
        cart_drawer: {
          type: 'cart-drawer',
          enabled: true,
          settings: { title: 'Your bag', subtitle: 'Review before checkout' },
          blocks: {
            empty_state: {
              type: 'empty',
              blocks: {
                empty_copy: { type: 'copy', settings: { title: 'Bag is empty' } },
                empty_cta: { type: 'cta', settings: { label: 'Browse catalog', href: '/' } },
              },
              block_order: ['empty_copy', 'empty_cta'],
            },
            line_list: {
              type: 'lines',
              blocks: {
                line_actions: { type: 'actions', settings: { removeLabel: 'Remove', qtyLabel: 'Qty' } },
              },
              block_order: ['line_actions'],
            },
            totals_panel: {
              type: 'totals',
              blocks: {
                subtotal_row: { type: 'subtotal', settings: { label: 'Subtotal' } },
                checkout_cta: { type: 'checkout', settings: { label: 'Checkout' } },
              },
              block_order: ['subtotal_row', 'checkout_cta'],
            },
          },
          block_order: ['empty_state', 'line_list', 'totals_panel'],
        },
      },
      section_order: ['cart_drawer'],
    },
    login: {
      name: 'Login',
      sections: {
        auth_gate: {
          type: 'auth-gate',
          enabled: true,
          settings: {
            panelTitle: 'Authenticate',
            panelSubtitle: 'Enter credentials to access your signal profile.',
            sideCaption: 'VOLT ID GATE',
          },
          blocks: {
            credential_fields: {
              type: 'fields',
              blocks: {
                email_field: { type: 'email', settings: { placeholder: 'Email' } },
                password_field: { type: 'password', settings: { placeholder: 'Password' } },
              },
              block_order: ['email_field', 'password_field'],
            },
            submit_pulse: { type: 'submit', settings: { label: 'Enter', loadingLabel: 'Verifying…' } },
            forgot_link: { type: 'link', settings: { label: 'Lost key?', href: '/auth/forgot-password' } },
            alt_route: {
              type: 'alt',
              blocks: {
                alt_prompt: { type: 'prompt', settings: { text: 'No ID yet?' } },
                alt_anchor: { type: 'anchor', settings: { label: 'Register', href: '/auth/signup' } },
              },
              block_order: ['alt_prompt', 'alt_anchor'],
            },
          },
          block_order: ['credential_fields', 'forgot_link', 'submit_pulse', 'alt_route'],
        },
      },
      section_order: ['auth_gate'],
    },
    signup: {
      name: 'Sign up',
      sections: {
        auth_register: {
          type: 'auth-register',
          enabled: true,
          settings: { panelTitle: 'Register ID', panelSubtitle: 'Create a new signal identity.' },
          blocks: {
            identity_fields: {
              type: 'fields',
              blocks: {
                first_field: { type: 'first', settings: { placeholder: 'First' } },
                last_field: { type: 'last', settings: { placeholder: 'Last' } },
                email_field: { type: 'email', settings: { placeholder: 'Email' } },
                password_field: { type: 'password', settings: { placeholder: 'Password' } },
              },
              block_order: ['first_field', 'last_field', 'email_field', 'password_field'],
            },
            submit_pulse: { type: 'submit', settings: { label: 'Create ID', loadingLabel: 'Creating…' } },
            alt_route: {
              type: 'alt',
              blocks: {
                alt_prompt: { type: 'prompt', settings: { text: 'Have an ID?' } },
                alt_anchor: { type: 'anchor', settings: { label: 'Sign in', href: '/auth/login' } },
              },
              block_order: ['alt_prompt', 'alt_anchor'],
            },
          },
          block_order: ['identity_fields', 'submit_pulse', 'alt_route'],
        },
      },
      section_order: ['auth_register'],
    },
    forgot_password: {
      name: 'Forgot password',
      sections: {
        auth_recover: {
          type: 'auth-recover',
          enabled: true,
          settings: { panelTitle: 'Recover key', panelSubtitle: 'We will send a reset pulse to your inbox.' },
          blocks: {
            recover_field: {
              type: 'field',
              blocks: { email_field: { type: 'email', settings: { placeholder: 'Email' } } },
              block_order: ['email_field'],
            },
            submit_pulse: { type: 'submit', settings: { label: 'Send pulse' } },
            success_flash: { type: 'success', settings: { text: 'Check your inbox.' } },
            back_route: {
              type: 'back',
              blocks: { back_anchor: { type: 'anchor', settings: { label: 'Back', href: '/auth/login' } } },
              block_order: ['back_anchor'],
            },
          },
          block_order: ['recover_field', 'submit_pulse', 'success_flash', 'back_route'],
        },
      },
      section_order: ['auth_recover'],
    },
    profile: {
      name: 'Profile',
      sections: {
        account_hub: {
          type: 'account-hub',
          enabled: true,
          settings: { title: 'Identity hub', subtitle: 'Manage your signal profile.' },
          blocks: {
            signed_out_gate: {
              type: 'signed-out',
              blocks: {
                gate_message: { type: 'message', settings: { text: 'Authenticate to open hub.' } },
                gate_button: { type: 'button', settings: { label: 'Sign in' } },
              },
              block_order: ['gate_message', 'gate_button'],
            },
            identity_form: {
              type: 'form',
              blocks: {
                email_readout: { type: 'email', settings: { label: 'Email', hint: 'Read-only' } },
                first_field: { type: 'first', settings: { placeholder: 'First' } },
                last_field: { type: 'last', settings: { placeholder: 'Last' } },
                phone_field: { type: 'phone', settings: { placeholder: 'Phone' } },
              },
              block_order: ['email_readout', 'first_field', 'last_field', 'phone_field'],
            },
            persist_action: { type: 'save', settings: { label: 'Save', savingLabel: 'Saving…' } },
          },
          block_order: ['signed_out_gate', 'identity_form', 'persist_action'],
        },
      },
      section_order: ['account_hub'],
    },
    orders: {
      name: 'Orders',
      sections: {
        order_timeline: {
          type: 'order-timeline',
          enabled: true,
          settings: { title: 'Order timeline', subtitle: 'Transmission history' },
          blocks: {
            loading_pulse: { type: 'loading', settings: { message: 'Syncing…' } },
            empty_pulse: { type: 'empty', settings: { message: 'No transmissions yet.' } },
            timeline_card: {
              type: 'card',
              blocks: {
                total_row: { type: 'total', settings: { label: 'Total' } },
                date_row: { type: 'date', settings: { prefix: 'Sent' } },
                status_row: { type: 'status', settings: { prefix: 'State' } },
              },
              block_order: ['total_row', 'date_row', 'status_row'],
            },
          },
          block_order: ['loading_pulse', 'empty_pulse', 'timeline_card'],
        },
      },
      section_order: ['order_timeline'],
    },
    preferences: {
      name: 'Preferences',
      sections: {
        signal_prefs: {
          type: 'signal-prefs',
          enabled: true,
          settings: { title: 'Signal preferences', subtitle: 'Tune marketing channels.' },
          blocks: {
            signed_out_gate: { type: 'signed-out', settings: { message: 'Sign in to tune signals.' } },
            channel_toggles: {
              type: 'channels',
              blocks: {
                email_toggle: { type: 'email', settings: { label: 'Email bursts' } },
                sms_toggle: { type: 'sms', settings: { label: 'SMS pings' } },
                locale_select: { type: 'locale', settings: { label: 'Locale' } },
              },
              block_order: ['locale_select', 'email_toggle', 'sms_toggle'],
            },
            persist_action: { type: 'save', settings: { label: 'Save', savingLabel: 'Saving…' } },
          },
          block_order: ['signed_out_gate', 'channel_toggles', 'persist_action'],
        },
      },
      section_order: ['signal_prefs'],
    },
  },
};

const manifest = {
  id: 'volt',
  name: 'Volt',
  version: '1.0.0',
  type: 'react-remote',
  configMode: 'sections',
  assets: {
    themeJs: 'theme.js',
    themeCss: 'theme.css',
    defaultConfig: 'theme.default-config.json',
    schema: 'theme.schema.json',
  },
  templates: [
    'index',
    'product',
    'cart',
    'login',
    'signup',
    'forgot_password',
    'profile',
    'orders',
    'preferences',
  ],
  capabilities: {
    sections: true,
    blocks: true,
    globalSettings: true,
    livePreview: true,
  },
  blockTypes: {
    basic: [
      { id: 'button', label: 'Button' },
      { id: 'heading', label: 'Heading' },
      { id: 'text', label: 'Text' },
      { id: 'badge', label: 'Badge' },
      { id: 'stat', label: 'Stat' },
    ],
    product: [
      { id: 'product-card', label: 'Product card' },
      { id: 'price', label: 'Price' },
      { id: 'title', label: 'Title' },
    ],
    volt: [
      { id: 'marquee-track', label: 'Marquee track' },
      { id: 'bento-tile', label: 'Bento tile' },
      { id: 'timeline-card', label: 'Timeline card' },
    ],
  },
  sectionBlocks: {
    hero: ['button', 'heading', 'text', 'badge'],
    'split-hero': ['button', 'badge'],
    bento: ['bento-tile', 'product-card'],
    'featured-collection': ['product-card', 'title'],
  },
};

for (const dir of [
  path.join(ROOT, 'Ziplofy', 'src', 'theme-packs', 'volt'),
  path.join(ROOT, 'Ziplofy3b', 'src', 'theme-packs', 'volt'),
]) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'theme.schema.json'), JSON.stringify(schema, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'theme.default-config.json'), JSON.stringify(defaultConfig, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'theme.manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
}

console.log('Volt pack written. Schema fields:', countFields(schema));
