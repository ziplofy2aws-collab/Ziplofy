/**
 * Horizon benchmark pack — sync rich editor schema + default-config from Ziplofy pack
 * to Ziplofy3b theme-packs. Run after editing theme source or schema.
 *
 *   node scripts/build-horizon-benchmark-schema.mjs
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SOURCE_PACK = path.join(ROOT, 'Ziplofy', 'src', 'theme-packs', 'horizon');
const TARGETS = [
  SOURCE_PACK,
  path.join(ROOT, 'Ziplofy3b', 'src', 'theme-packs', 'horizon'),
];

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function writeJson(p, data) {
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function field(path, type, label, extra = {}) {
  return { path, type, label, ...extra };
}

function hasPath(fields, suffix) {
  return (fields || []).some((f) => f.path === suffix || f.path?.endsWith(`.${suffix.split('.').pop()}`));
}

function countFields(schema) {
  let n = 0;
  const walkFields = (arr) => {
    for (const f of arr || []) {
      n += 1;
    }
  };
  const walkBlocks = (blocks) => {
    for (const b of blocks || []) {
      walkFields(b.settingsFields);
      walkBlocks(b.blocks);
    }
  };
  for (const g of schema.globalSettings?.groups || []) walkFields(g.fields);
  for (const layout of Object.values(schema.layout || {})) {
    walkFields(layout.settingsFields);
    walkBlocks(layout.blocks);
  }
  for (const tpl of schema.templates || []) {
    for (const sec of tpl.sections || []) {
      walkFields(sec.settingsFields);
      walkBlocks(sec.blocks);
    }
  }
  return n;
}

function enrichAnnouncementBar(layout) {
  const ab = layout.announcement_bar;
  if (!ab) return;
  ab.label = 'Announcement bar';
  ab.description =
    'Top-of-store promo strip. Section settings control layout/appearance; block "Announcement" holds rotating message text.';
  const fields = ab.settingsFields || [];

  const ensure = (f) => {
    if (!hasPath(fields, f.path)) fields.push(f);
  };

  ensure(
    field('sections.announcement_bar.settings.timeToNext', 'number', 'Time to next announcement', {
      group: 'General',
      widget: 'slider',
      min: 0,
      max: 30,
      step: 1,
      unit: 'sec',
      sidebar: false,
      description: 'Seconds between messages when multiple announcement blocks exist. Use 0 to disable rotation.',
    })
  );
  ensure(
    field('sections.announcement_bar.settings.enabled', 'boolean', 'Show announcement', {
      group: 'General',
      sidebar: false,
    })
  );
  ensure(
    field('sections.announcement_bar.settings.message', 'text', 'Announcement text (legacy)', {
      group: 'Content',
      sidebar: false,
      description: 'Fallback when no announcement block text is set.',
    })
  );
  ensure(
    field('sections.announcement_bar.settings.linkLabel', 'text', 'Link label', {
      group: 'Content',
      sidebar: false,
    })
  );
  ensure(
    field('sections.announcement_bar.settings.linkHref', 'text', 'Link URL', {
      group: 'Content',
      sidebar: false,
    })
  );
  ensure(
    field('sections.announcement_bar.settings.sectionWidth', 'select', 'Section width', {
      group: 'Appearance',
      widget: 'segmented',
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
      sidebar: false,
    })
  );
  ensure(
    field('sections.announcement_bar.settings.colorScheme', 'select', 'Color scheme', {
      group: 'Appearance',
      widget: 'color-scheme',
      options: [
        { value: 'scheme-1', label: 'Scheme 1' },
        { value: 'scheme-2', label: 'Scheme 2' },
        { value: 'scheme-3', label: 'Scheme 3' },
        { value: 'scheme-4', label: 'Scheme 4' },
      ],
      sidebar: false,
    })
  );
  ensure(
    field('sections.announcement_bar.settings.dividerThickness', 'number', 'Divider thickness', {
      group: 'Appearance',
      widget: 'slider',
      min: 0,
      max: 20,
      step: 1,
      unit: 'px',
      sidebar: false,
    })
  );
  ensure(
    field('sections.announcement_bar.settings.paddingTop', 'number', 'Top', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    })
  );
  ensure(
    field('sections.announcement_bar.settings.paddingBottom', 'number', 'Bottom', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    })
  );
  ensure(
    field('sections.announcement_bar.settings.customCss', 'textarea', 'Custom CSS', {
      group: 'Custom CSS',
      widget: 'accordion',
      sidebar: false,
    })
  );

  for (const f of fields) {
    const key = f.path.split('.').pop();
    if (key === 'enabled') f.group = 'General';
    if (key === 'timeToNext') {
      f.group = 'General';
      f.min = 0;
      f.max = 30;
      f.widget = 'slider';
      f.unit = 'sec';
    }
  }

  const groupRank = { General: 0, Appearance: 1, Padding: 2, 'Custom CSS': 3, Content: 9 };
  const pathRank = {
    enabled: 0,
    timeToNext: 1,
    sectionWidth: 10,
    colorScheme: 11,
    dividerThickness: 12,
    paddingTop: 20,
    paddingBottom: 21,
    customCss: 30,
  };
  ab.settingsFields = fields.sort((a, b) => {
    const ga = groupRank[a.group] ?? 5;
    const gb = groupRank[b.group] ?? 5;
    if (ga !== gb) return ga - gb;
    const ka = pathRank[a.path.split('.').pop()] ?? 50;
    const kb = pathRank[b.path.split('.').pop()] ?? 50;
    return ka - kb;
  });

  const blockBase = 'sections.announcement_bar.blocks.announcement.settings';
  const blockFields = [
    field(`${blockBase}.text`, 'textarea', 'Text', {
      group: 'Content',
      widget: 'richtext',
      sidebar: false,
      description: 'Announcement message shown in the bar.',
    }),
    field(`${blockBase}.link`, 'text', 'Link', {
      group: 'Content',
      widget: 'link',
      placeholder: 'Paste a link or search',
      sidebar: false,
    }),
    field(`${blockBase}.font`, 'select', 'Font', {
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'body', label: 'Body' },
        { value: 'subheading', label: 'Subheading' },
        { value: 'heading', label: 'Heading' },
        { value: 'accent', label: 'Accent' },
      ],
    }),
    field(`${blockBase}.fontSize`, 'select', 'Size', {
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      options: [
        { value: '10px', label: '10px' },
        { value: '12px', label: '12px' },
        { value: '14px', label: '14px' },
        { value: '16px', label: '16px' },
        { value: '18px', label: '18px' },
      ],
    }),
    field(`${blockBase}.fontWeight`, 'select', 'Weight', {
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'default', label: 'Default' },
        { value: '300', label: 'Light' },
        { value: '400', label: 'Regular' },
        { value: '500', label: 'Medium' },
        { value: '600', label: 'Semibold' },
        { value: '700', label: 'Bold' },
      ],
    }),
    field(`${blockBase}.letterSpacing`, 'select', 'Letter spacing', {
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'tight', label: 'Tight' },
        { value: 'normal', label: 'Normal' },
        { value: 'wide', label: 'Wide' },
      ],
    }),
    field(`${blockBase}.textCase`, 'select', 'Case', {
      group: 'Typography',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'default', label: 'Default' },
        { value: 'uppercase', label: 'Uppercase' },
      ],
    }),
  ];

  const blockRank = { text: 0, link: 1, font: 10, fontSize: 11, fontWeight: 12, letterSpacing: 13, textCase: 14 };
  const blockGroupRank = { Content: 0, Typography: 1 };

  if (!ab.blocks?.length) {
    ab.blocks = [{ id: 'announcement', label: 'Announcement', settingsFields: blockFields }];
  } else {
    const ann = ab.blocks.find((b) => b.id === 'announcement') ?? ab.blocks[0];
    ann.label = 'Announcement';
    const existing = ann.settingsFields ?? [];
    for (const f of blockFields) {
      if (!hasPath(existing, f.path)) existing.push(f);
    }
    for (const f of existing) {
      const key = f.path.split('.').pop();
      const canon = blockFields.find((c) => c.path.endsWith(`.${key}`));
      if (canon) {
        f.group = canon.group;
        f.widget = canon.widget;
        f.options = canon.options;
        f.placeholder = canon.placeholder;
        f.sidebar = false;
        if (key === 'text') f.type = 'textarea';
      }
    }
    ann.settingsFields = existing.sort((a, b) => {
      const ga = blockGroupRank[a.group] ?? 9;
      const gb = blockGroupRank[b.group] ?? 9;
      if (ga !== gb) return ga - gb;
      return (blockRank[a.path.split('.').pop()] ?? 50) - (blockRank[b.path.split('.').pop()] ?? 50);
    });
  }
}

function enrichHeader(layout) {
  const hdr = layout.header;
  if (!hdr) return;
  hdr.label = 'Header';
  hdr.description =
    'Store header — logo, navigation, search, localization, and appearance. Select Header in the sidebar for layout settings; open Logo or Menu blocks for content.';

  const base = 'sections.header.settings';
  const logoBase = 'sections.header.blocks.logo.settings';
  const menuBase = 'sections.header.blocks.menu.settings';

  const pos3 = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ];
  const pos2 = [
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
  ];
  const row2 = [
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
  ];
  const schemes = [
    { value: 'scheme-1', label: 'Scheme 1' },
    { value: 'scheme-2', label: 'Scheme 2' },
    { value: 'scheme-3', label: 'Scheme 3' },
    { value: 'scheme-4', label: 'Scheme 4' },
  ];

  hdr.settingsFields = [
    field(`${base}.customerAccountMenu`, 'select', 'Menu', {
      group: 'Customer account',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'customer-account', label: 'Customer account' },
        { value: 'none', label: 'None' },
      ],
      description: 'Manage visibility in customer account settings. Legacy accounts not supported.',
    }),
    field(`${base}.searchIcon`, 'boolean', 'Search icon', {
      group: 'Search',
      sidebar: false,
    }),
    field(`${base}.searchPosition`, 'select', 'Position', {
      group: 'Search',
      widget: 'segmented',
      options: pos2,
      sidebar: false,
    }),
    field(`${base}.searchRow`, 'select', 'Row', {
      group: 'Search',
      widget: 'segmented',
      options: row2,
      sidebar: false,
    }),
    field(`${base}.searchPlaceholder`, 'text', 'Search placeholder', {
      group: 'Search',
      sidebar: false,
      placeholder: 'Search products…',
    }),
    field(`${base}.countryRegionEnabled`, 'boolean', 'Country/Region', {
      group: 'Localization',
      sidebar: false,
      description: 'Manage countries/regions',
    }),
    field(`${base}.showFlag`, 'boolean', 'Flag', { group: 'Localization', sidebar: false }),
    field(`${base}.languageSelectorEnabled`, 'boolean', 'Language selector', {
      group: 'Localization',
      sidebar: false,
      description: 'Manage languages',
    }),
    field(`${base}.localizationFont`, 'select', 'Font', {
      group: 'Localization',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'heading', label: 'Heading' },
        { value: 'body', label: 'Body' },
        { value: 'subheading', label: 'Subheading' },
      ],
    }),
    field(`${base}.localizationSize`, 'select', 'Size', {
      group: 'Localization',
      widget: 'select',
      sidebar: false,
      options: [
        { value: '12px', label: '12px' },
        { value: '14px', label: '14px' },
        { value: '16px', label: '16px' },
      ],
    }),
    field(`${base}.localizationPosition`, 'select', 'Position', {
      group: 'Localization',
      widget: 'segmented',
      options: pos2,
      sidebar: false,
    }),
    field(`${base}.localizationRow`, 'select', 'Row', {
      group: 'Localization',
      widget: 'segmented',
      options: row2,
      sidebar: false,
    }),
    field(`${base}.sectionWidth`, 'select', 'Width', {
      group: 'Appearance',
      widget: 'segmented',
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
      sidebar: false,
    }),
    field(`${base}.headerHeight`, 'select', 'Height', {
      group: 'Appearance',
      widget: 'segmented',
      options: [
        { value: 'compact', label: 'Compact' },
        { value: 'standard', label: 'Standard' },
      ],
      sidebar: false,
    }),
    field(`${base}.stickyMode`, 'select', 'Sticky header', {
      group: 'Appearance',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'always', label: 'Always' },
        { value: 'on-scroll-up', label: 'On scroll up' },
        { value: 'never', label: 'Never' },
      ],
    }),
    field(`${base}.borderThickness`, 'number', 'Border thickness', {
      group: 'Appearance',
      widget: 'slider',
      min: 0,
      max: 12,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.menuStyle`, 'select', 'Menu style', {
      group: 'Utilities',
      widget: 'segmented',
      options: [
        { value: 'icons', label: 'Icons' },
        { value: 'text', label: 'Text' },
      ],
      sidebar: false,
      description: 'Icons are always used on mobile',
    }),
    field(`${base}.colorScheme`, 'select', 'Default', {
      group: 'Colors',
      widget: 'color-scheme',
      options: schemes,
      sidebar: false,
    }),
    field(`${base}.homeTransparentBackground`, 'boolean', 'Home page', {
      group: 'Page backgrounds',
      sidebar: false,
      description: 'Transparent background',
    }),
    field(`${base}.productTransparentBackground`, 'boolean', 'Product page', {
      group: 'Page backgrounds',
      sidebar: false,
      description: 'Transparent background',
    }),
    field(`${base}.collectionTransparentBackground`, 'boolean', 'Collection page', {
      group: 'Page backgrounds',
      sidebar: false,
      description: 'Transparent background',
    }),
    field(`${base}.defaultLogoUrl`, 'text', 'Default logo', {
      group: 'Theme settings',
      sidebar: false,
      placeholder: 'Image URL or leave empty to use store name',
    }),
    field(`${base}.cartType`, 'select', 'Type', {
      group: 'Theme settings',
      widget: 'segmented',
      options: [
        { value: 'page', label: 'Page' },
        { value: 'drawer', label: 'Drawer' },
      ],
      sidebar: false,
    }),
    field(`${base}.productTitleCase`, 'select', 'Product title case', {
      group: 'Theme settings',
      widget: 'segmented',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'uppercase', label: 'Uppercase' },
      ],
      sidebar: false,
    }),
    field(`${base}.emptyCartLink`, 'text', 'Empty cart button link', {
      group: 'Theme settings',
      widget: 'link',
      sidebar: false,
      placeholder: 'All Products',
    }),
    field(`${base}.cartDrawerAutoOpen`, 'boolean', '"Add to cart" auto-opens drawer', {
      group: 'Theme settings',
      sidebar: false,
    }),
    field(`${base}.cartLabel`, 'text', 'Cart label', {
      group: 'Theme settings',
      sidebar: false,
    }),
    field(`${base}.customCss`, 'textarea', 'Custom CSS', {
      group: 'Custom CSS',
      widget: 'accordion',
      sidebar: false,
    }),
  ];

  const sectionGroupRank = {
    Logo: 0,
    Menu: 1,
    'Customer account': 2,
    Search: 3,
    Localization: 4,
    Appearance: 5,
    Utilities: 6,
    Colors: 7,
    'Page backgrounds': 8,
    'Theme settings': 9,
    'Custom CSS': 10,
  };
  const sectionPathRank = {
    customerAccountMenu: 0,
    searchIcon: 10,
    searchPosition: 11,
    searchRow: 12,
    searchPlaceholder: 13,
    countryRegionEnabled: 20,
    showFlag: 21,
    languageSelectorEnabled: 22,
    localizationFont: 23,
    localizationSize: 24,
    localizationPosition: 25,
    localizationRow: 26,
    sectionWidth: 30,
    headerHeight: 31,
    stickyMode: 32,
    borderThickness: 33,
    menuStyle: 40,
    colorScheme: 50,
    homeTransparentBackground: 60,
    productTransparentBackground: 61,
    collectionTransparentBackground: 62,
    defaultLogoUrl: 70,
    cartType: 71,
    productTitleCase: 72,
    emptyCartLink: 73,
    cartDrawerAutoOpen: 74,
    cartLabel: 75,
    customCss: 80,
  };
  hdr.settingsFields.sort((a, b) => {
    const ga = sectionGroupRank[a.group] ?? 5;
    const gb = sectionGroupRank[b.group] ?? 5;
    if (ga !== gb) return ga - gb;
    const ka = sectionPathRank[a.path.split('.').pop()] ?? 50;
    const kb = sectionPathRank[b.path.split('.').pop()] ?? 50;
    return ka - kb;
  });

  const logoBlock = hdr.blocks?.find((b) => b.id === 'logo');
  if (logoBlock) {
    logoBlock.settingsFields = [
      field(`${logoBase}.text`, 'text', 'Store name', { sidebar: true }),
      field(`${logoBase}.tagline`, 'text', 'Tagline', { sidebar: true }),
      field(`${logoBase}.position`, 'select', 'Position', {
        group: 'Logo',
        widget: 'segmented',
        options: pos3,
        sidebar: false,
      }),
    ];
  }

  const menuBlock = hdr.blocks?.find((b) => b.id === 'menu');
  if (menuBlock) {
    const linkBlocks = menuBlock.blocks ?? [];
    const layoutFields = [
      field(`${menuBase}.position`, 'select', 'Position', {
        group: 'Menu',
        widget: 'segmented',
        options: pos3,
        sidebar: false,
      }),
      field(`${menuBase}.row`, 'select', 'Row', {
        group: 'Menu',
        widget: 'segmented',
        options: row2,
        sidebar: false,
      }),
    ];
    const existingLinks = linkBlocks;
    menuBlock.settingsFields = layoutFields;
    menuBlock.blocks = existingLinks;
  }
}

function enrichFooter(layout) {
  const ft = layout.footer;
  if (!ft) return;
  ft.label = 'Footer';
  ft.description =
    'Site footer — layout, spacing, and color scheme. Open Email signup or other blocks for content.';

  const base = 'sections.footer.settings';
  const schemes = [
    { value: 'scheme-1', label: 'Scheme 1' },
    { value: 'scheme-2', label: 'Scheme 2' },
    { value: 'scheme-3', label: 'Scheme 3' },
    { value: 'scheme-4', label: 'Scheme 4' },
  ];

  ft.settingsFields = [
    field(`${base}.sectionWidth`, 'select', 'Width', {
      group: 'General',
      widget: 'segmented',
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
      sidebar: false,
    }),
    field(`${base}.gap`, 'number', 'Gap', {
      group: 'General',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.colorScheme`, 'select', 'Color scheme', {
      group: 'General',
      widget: 'color-scheme',
      options: schemes,
      sidebar: false,
    }),
    field(`${base}.paddingTop`, 'number', 'Top', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 200,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.paddingBottom`, 'number', 'Bottom', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 200,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.customCss`, 'textarea', 'Custom CSS', {
      group: 'Custom CSS',
      widget: 'accordion',
      sidebar: false,
    }),
  ];

  enrichNewsletterBlock(ft);
}

function dividerSettingsFields(base) {
  const schemes = [
    { value: 'scheme-1', label: 'Scheme 1' },
    { value: 'scheme-2', label: 'Scheme 2' },
    { value: 'scheme-3', label: 'Scheme 3' },
    { value: 'scheme-4', label: 'Scheme 4' },
  ];
  return [
    field(`${base}.colorScheme`, 'select', 'Color scheme', {
      group: 'General',
      widget: 'color-scheme',
      options: schemes,
      sidebar: false,
    }),
    field(`${base}.sectionWidth`, 'select', 'Width', {
      group: 'General',
      widget: 'segmented',
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
      sidebar: false,
    }),
    field(`${base}.thickness`, 'number', 'Thickness', {
      group: 'General',
      widget: 'slider',
      min: 0,
      max: 20,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.length`, 'number', 'Length', {
      group: 'General',
      widget: 'slider',
      min: 10,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: false,
    }),
    field(`${base}.paddingTop`, 'number', 'Top', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.paddingBottom`, 'number', 'Bottom', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.customCss`, 'textarea', 'Custom CSS', {
      group: 'Custom CSS',
      widget: 'accordion',
      sidebar: false,
    }),
  ];
}

function enrichDivider(layout) {
  layout.divider = {
    label: 'Divider',
    description: 'A horizontal line to separate content.',
    settingsFields: dividerSettingsFields('sections.divider.settings'),
  };
}

function enrichDividerTemplateSections(schema) {
  for (const tpl of schema.templates || []) {
    const base = `templates.${tpl.id}.sections.divider.settings`;
    const fields = dividerSettingsFields(base);
    const sec = tpl.sections?.find((s) => s.id === 'divider');
    if (sec) {
      sec.type = 'divider';
      sec.label = 'Divider';
      sec.settingsFields = fields;
    } else {
      tpl.sections = [...(tpl.sections || []), { id: 'divider', type: 'divider', label: 'Divider', settingsFields: fields }];
    }
  }
}

const TYPOGRAPHY_PRESETS = [
  { value: 'heading-1', label: 'Heading 1' },
  { value: 'heading-2', label: 'Heading 2' },
  { value: 'heading-3', label: 'Heading 3' },
  { value: 'heading-4', label: 'Heading 4' },
  { value: 'body', label: 'Body' },
  { value: 'paragraph', label: 'Paragraph' },
];

function enrichNewsletterBlock(footerLayout) {
  const newsletterBlock = footerLayout.blocks?.find((b) => b.id === 'newsletter');
  if (!newsletterBlock) return;
  newsletterBlock.label = 'Email signup';

  const nb = 'sections.footer.blocks.newsletter.settings';
  newsletterBlock.settingsFields = [
    field(`${nb}.signupsCustomerProfiles`, 'paragraph', 'customer profiles', {
      widget: 'info-link',
      placeholder: '/customers',
      description: 'Signups add customer profiles',
      sidebar: false,
    }),
    field(`${nb}.placeholder`, 'text', 'Email placeholder', {
      sidebar: false,
    }),
  ];
}

function enrichFooterUtilities(layout) {
  const fu = layout.footer_utilities;
  if (!fu) return;
  fu.label = 'Utilities';
  fu.description =
    'Footer utilities bar — copyright, policy links, and social icons. Section settings control layout and appearance.';

  const base = 'sections.footer_utilities.settings';
  const schemes = [
    { value: 'scheme-1', label: 'Scheme 1' },
    { value: 'scheme-2', label: 'Scheme 2' },
    { value: 'scheme-3', label: 'Scheme 3' },
    { value: 'scheme-4', label: 'Scheme 4' },
  ];

  fu.settingsFields = [
    field(`${base}.sectionWidth`, 'select', 'Width', {
      group: 'General',
      widget: 'segmented',
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
      sidebar: false,
    }),
    field(`${base}.gap`, 'number', 'Gap', {
      group: 'General',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.dividerThickness`, 'number', 'Divider thickness', {
      group: 'General',
      widget: 'slider',
      min: 0,
      max: 12,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.colorScheme`, 'select', 'Color scheme', {
      group: 'General',
      widget: 'color-scheme',
      options: schemes,
      sidebar: false,
    }),
    field(`${base}.paddingTop`, 'number', 'Top', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.paddingBottom`, 'number', 'Bottom', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.paymentIcons`, 'boolean', 'Show payment icons', {
      group: 'Theme settings',
      sidebar: false,
      description: 'Display payment method icons in the utilities bar when enabled.',
    }),
    field(`${base}.followOnShop`, 'boolean', 'Follow on Shop', {
      group: 'Theme settings',
      sidebar: false,
      description: 'Show Follow on Shop button when the store supports it.',
    }),
    field(`${base}.customCss`, 'textarea', 'Custom CSS', {
      group: 'Custom CSS',
      widget: 'accordion',
      sidebar: false,
    }),
  ];

  const copyrightBlock = fu.blocks?.find((b) => b.id === 'copyright');
  if (copyrightBlock) {
    const cb = 'sections.footer_utilities.blocks.copyright.settings';
    copyrightBlock.settingsFields = [
      field(`${cb}.showPoweredBy`, 'boolean', 'Show "Powered by Shopify"', {
        sidebar: false,
      }),
      field(`${cb}.manageStoreName`, 'paragraph', 'Manage store name', {
        sidebar: false,
        widget: 'info-link',
        description: 'Update your store name in general settings.',
      }),
      field(`${cb}.fontSize`, 'select', 'Size', {
        sidebar: false,
        widget: 'select',
        options: [
          { value: '10px', label: '10px' },
          { value: '12px', label: '12px' },
          { value: '14px', label: '14px' },
          { value: '16px', label: '16px' },
          { value: '18px', label: '18px' },
        ],
      }),
      field(`${cb}.textCase`, 'select', 'Case', {
        sidebar: false,
        widget: 'segmented',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'uppercase', label: 'Uppercase' },
        ],
      }),
      field(`${cb}.text`, 'text', 'Copyright', {
        sidebar: false,
        description: 'Legacy copyright line; store name is derived for preview.',
      }),
    ];
  }

  const policyLinksBlock = fu.blocks?.find((b) => b.id === 'policy_links');
  if (policyLinksBlock) {
    const pb = 'sections.footer_utilities.blocks.policy_links.settings';
    policyLinksBlock.settingsFields = [
      field(`${pb}.managePolicies`, 'paragraph', 'Manage policies', {
        sidebar: false,
        widget: 'info-link',
        placeholder: '/settings/policies',
        description: 'Create and edit store policies in settings.',
      }),
      field(`${pb}.fontSize`, 'select', 'Size', {
        sidebar: false,
        widget: 'select',
        options: [
          { value: '10px', label: '10px' },
          { value: '12px', label: '12px' },
          { value: '14px', label: '14px' },
          { value: '16px', label: '16px' },
          { value: '18px', label: '18px' },
        ],
      }),
      field(`${pb}.textCase`, 'select', 'Case', {
        sidebar: false,
        widget: 'segmented',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'uppercase', label: 'Uppercase' },
        ],
      }),
      field(`${pb}.privacyLabel`, 'text', 'Privacy label', { sidebar: false }),
      field(`${pb}.privacyHref`, 'text', 'Privacy link', { sidebar: false }),
      field(`${pb}.termsLabel`, 'text', 'Terms label', { sidebar: false }),
      field(`${pb}.termsHref`, 'text', 'Terms link', { sidebar: false }),
    ];
  }

  const socialBlock = fu.blocks?.find((b) => b.id === 'social');
  if (socialBlock) {
    socialBlock.label = 'Social media links';
    const sb = 'sections.footer_utilities.blocks.social.settings';
    const platforms = [
      ['facebookUrl', 'Facebook'],
      ['instagramUrl', 'Instagram'],
      ['youtubeUrl', 'YouTube'],
      ['tiktokUrl', 'TikTok'],
      ['twitterUrl', 'X (Twitter)'],
      ['threadsUrl', 'Threads'],
      ['linkedinUrl', 'LinkedIn'],
      ['blueskyUrl', 'Bluesky'],
      ['snapchatUrl', 'Snapchat'],
      ['pinterestUrl', 'Pinterest'],
      ['tumblrUrl', 'Tumblr'],
      ['vimeoUrl', 'Vimeo'],
      ['customUrl', 'Custom link'],
    ];
    socialBlock.settingsFields = platforms.map(([key, label]) =>
      field(`${sb}.${key}`, 'text', label, {
        sidebar: false,
        widget: 'link',
        placeholder: 'Paste a link or search',
      })
    );
  }
}

function enrichHeroSection(schema) {
  const indexTpl = schema.templates?.find((t) => t.id === 'index');
  const sec = indexTpl?.sections?.find((s) => s.id === 'hero_main');
  if (!sec) return;

  const base = 'templates.index.sections.hero_main.settings';
  const schemes = [
    { value: 'scheme-1', label: 'Scheme 1' },
    { value: 'scheme-2', label: 'Scheme 2' },
    { value: 'scheme-3', label: 'Scheme 3' },
    { value: 'scheme-4', label: 'Scheme 4' },
    { value: 'scheme-5', label: 'Scheme 5' },
    { value: 'scheme-6', label: 'Scheme 6' },
  ];

  sec.label = 'Hero';
  sec.settingsFields = [
    field(`${base}.media1Type`, 'select', 'Type', {
      group: 'Media 1',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'image', label: 'Image' },
        { value: 'video', label: 'Video' },
      ],
    }),
    field(`${base}.media1ImageUrl`, 'text', 'Image', {
      group: 'Media 1',
      sidebar: false,
      placeholder: 'Paste image URL or upload',
    }),
    field(`${base}.media2Type`, 'select', 'Type', {
      group: 'Media 2',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'image', label: 'Image' },
        { value: 'video', label: 'Video' },
      ],
    }),
    field(`${base}.media2ImageUrl`, 'text', 'Image', {
      group: 'Media 2',
      sidebar: false,
      placeholder: 'Paste image URL or upload',
    }),
    field(`${base}.mobileStackMedia`, 'boolean', 'Stack media', {
      group: 'Mobile media',
      sidebar: false,
    }),
    field(`${base}.mobileDifferentMedia`, 'boolean', 'Show different media on mobile', {
      group: 'Mobile media',
      sidebar: false,
    }),
    field(`${base}.mobileImageUrl`, 'text', 'Mobile image', {
      group: 'Mobile media',
      sidebar: false,
      placeholder: 'Paste image URL',
    }),
    field(`${base}.sectionLink`, 'text', 'Link', {
      group: 'Section link',
      widget: 'link',
      sidebar: false,
      placeholder: 'Paste a link or search',
    }),
    field(`${base}.sectionLinkNewTab`, 'boolean', 'Open link in new tab', {
      group: 'Section link',
      sidebar: false,
    }),
    field(`${base}.direction`, 'select', 'Direction', {
      group: 'Layout',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'vertical', label: 'Vertical' },
        { value: 'horizontal', label: 'Horizontal' },
      ],
    }),
    field(`${base}.alignTextBaseline`, 'boolean', 'Align text baseline', {
      group: 'Layout',
      sidebar: false,
    }),
    field(`${base}.layoutAlignment`, 'select', 'Alignment', {
      group: 'Layout',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    }),
    field(`${base}.position`, 'select', 'Position', {
      group: 'Layout',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'top', label: 'Top' },
        { value: 'center', label: 'Center' },
        { value: 'bottom', label: 'Bottom' },
      ],
    }),
    field(`${base}.layoutGap`, 'number', 'Gap', {
      group: 'Layout',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.sectionWidth`, 'select', 'Width', {
      group: 'Layout',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
    }),
    field(`${base}.height`, 'select', 'Height', {
      group: 'Layout',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
        { value: 'full', label: 'Full screen' },
      ],
    }),
    field(`${base}.colorScheme`, 'select', 'Color scheme', {
      group: 'Appearance',
      widget: 'color-scheme',
      options: schemes,
      sidebar: false,
    }),
    field(`${base}.mediaOverlay`, 'boolean', 'Media overlay', {
      group: 'Appearance',
      sidebar: false,
    }),
    field(`${base}.overlayColor`, 'color', 'Overlay color', {
      group: 'Appearance',
      sidebar: false,
    }),
    field(`${base}.overlayStyle`, 'select', 'Overlay style', {
      group: 'Appearance',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'solid', label: 'Solid' },
        { value: 'gradient', label: 'Gradient' },
      ],
    }),
    field(`${base}.blurredReflection`, 'boolean', 'Blurred reflection', {
      group: 'Appearance',
      sidebar: false,
      description: 'Applies to images only',
    }),
    field(`${base}.paddingTop`, 'number', 'Top', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 200,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.paddingBottom`, 'number', 'Bottom', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 200,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.customCss`, 'textarea', 'Custom CSS', {
      group: 'Custom CSS',
      widget: 'accordion',
      sidebar: false,
    }),
    field(`${base}.eyebrow`, 'text', 'Eyebrow', { sidebar: false }),
    field(`${base}.subtitle`, 'textarea', 'Text', { sidebar: false }),
  ];

  enrichHeroHeadingBlock(sec, base);
  enrichHeroButtonBlocks(sec);

  const groupRank = {
    'Media 1': 0,
    'Media 2': 1,
    'Mobile media': 2,
    'Section link': 3,
    Layout: 4,
    Appearance: 5,
    Padding: 6,
    'Custom CSS': 7,
  };
  const pathRank = {
    media1Type: 0,
    media1ImageUrl: 1,
    media2Type: 10,
    media2ImageUrl: 11,
    mobileStackMedia: 20,
    mobileDifferentMedia: 21,
    mobileImageUrl: 22,
    sectionLink: 30,
    sectionLinkNewTab: 31,
    direction: 40,
    alignTextBaseline: 41,
    layoutAlignment: 42,
    position: 43,
    layoutGap: 44,
    sectionWidth: 45,
    height: 46,
    colorScheme: 50,
    mediaOverlay: 51,
    overlayColor: 52,
    overlayStyle: 53,
    blurredReflection: 54,
    paddingTop: 60,
    paddingBottom: 61,
    customCss: 70,
    eyebrow: 80,
    subtitle: 82,
  };
  sec.settingsFields = sec.settingsFields.filter((f) => f.path.split('.').pop() !== 'title');
  sec.settingsFields.sort((a, b) => {
    const ga = groupRank[a.group] ?? 9;
    const gb = groupRank[b.group] ?? 9;
    if (ga !== gb) return ga - gb;
    return (pathRank[a.path.split('.').pop()] ?? 50) - (pathRank[b.path.split('.').pop()] ?? 50);
  });
}

function enrichHeroHeadingBlock(sec, base) {
  if (!sec.blocks) sec.blocks = [];
  let headingBlock = sec.blocks.find((b) => b.id === 'heading');
  if (!headingBlock) {
    headingBlock = { id: 'heading', label: 'Heading', settingsFields: [] };
    sec.blocks.unshift(headingBlock);
  }

  headingBlock.settingsFields = [
    field(`${base}.title`, 'textarea', 'Text', {
      group: 'Text',
      widget: 'richtext',
      sidebar: false,
      description: 'Hero heading text.',
    }),
    field(`${base}.headingWidth`, 'select', 'Width', {
      group: 'Layout',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'fill', label: 'Fill' },
      ],
    }),
    field(`${base}.headingMaxWidth`, 'select', 'Max width', {
      group: 'Layout',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'narrow', label: 'Narrow' },
        { value: 'normal', label: 'Normal' },
        { value: 'wide', label: 'Wide' },
        { value: 'none', label: 'None' },
      ],
    }),
    field(`${base}.headingTypographyPreset`, 'select', 'Preset', {
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      description: 'Edit presets in theme settings',
      options: [
        { value: 'heading-1', label: 'Heading 1' },
        { value: 'heading-2', label: 'Heading 2' },
        { value: 'heading-3', label: 'Heading 3' },
        { value: 'heading-4', label: 'Heading 4' },
        { value: 'body', label: 'Body' },
      ],
    }),
    field(`${base}.headingColor`, 'select', 'Color', {
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'text', label: 'Text' },
        { value: 'heading', label: 'Heading' },
        { value: 'accent', label: 'Accent' },
      ],
    }),
    field(`${base}.headingBackgroundEnabled`, 'boolean', 'Background', {
      group: 'Appearance',
      sidebar: false,
    }),
    field(`${base}.headingPaddingTop`, 'number', 'Top', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.headingPaddingBottom`, 'number', 'Bottom', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.headingPaddingLeft`, 'number', 'Left', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.headingPaddingRight`, 'number', 'Right', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
  ];

  const groupRank = { Text: 0, Layout: 1, Typography: 2, Appearance: 3, Padding: 4 };
  const pathRank = {
    title: 0,
    headingWidth: 1,
    headingMaxWidth: 2,
    headingTypographyPreset: 10,
    headingColor: 11,
    headingBackgroundEnabled: 20,
    headingPaddingTop: 30,
    headingPaddingBottom: 31,
    headingPaddingLeft: 32,
    headingPaddingRight: 33,
  };
  headingBlock.settingsFields.sort((a, b) => {
    const ga = groupRank[a.group] ?? 9;
    const gb = groupRank[b.group] ?? 9;
    if (ga !== gb) return ga - gb;
    return (pathRank[a.path.split('.').pop()] ?? 50) - (pathRank[b.path.split('.').pop()] ?? 50);
  });
}

function enrichHeroButtonBlocks(sec) {
  const defs = [
    { id: 'primary_button', defaultStyle: 'primary' },
    { id: 'secondary_button', defaultStyle: 'secondary' },
  ];
  for (const { id, defaultStyle } of defs) {
    const block = sec.blocks?.find((b) => b.id === id);
    if (!block) continue;
    const bb = `templates.index.sections.hero_main.blocks.${id}.settings`;
    block.settingsFields = [
      field(`${bb}.label`, 'text', 'Label', { group: 'Content', sidebar: false }),
      field(`${bb}.href`, 'text', 'Link', {
        group: 'Content',
        widget: 'link',
        sidebar: false,
        placeholder: 'Paste a link or search',
      }),
      field(`${bb}.openInNewTab`, 'boolean', 'Open link in new tab', {
        group: 'Content',
        sidebar: false,
      }),
      field(`${bb}.buttonStyle`, 'select', 'Style', {
        group: 'Appearance',
        widget: 'select',
        sidebar: false,
        options: [
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
        ],
      }),
      field(`${bb}.desktopWidth`, 'select', 'Desktop width', {
        group: 'Size',
        widget: 'segmented',
        sidebar: false,
        options: [
          { value: 'fit', label: 'Fit' },
          { value: 'custom', label: 'Custom' },
        ],
      }),
      field(`${bb}.mobileWidth`, 'select', 'Mobile width', {
        group: 'Size',
        widget: 'segmented',
        sidebar: false,
        options: [
          { value: 'fit', label: 'Fit' },
          { value: 'custom', label: 'Custom' },
        ],
      }),
      field(`${bb}.ariaLabel`, 'text', 'Accessibility label', { sidebar: false }),
    ];
    const groupRank = { Content: 0, Appearance: 1, Size: 2 };
    const pathRank = {
      label: 0,
      href: 1,
      openInNewTab: 2,
      buttonStyle: 10,
      desktopWidth: 11,
      mobileWidth: 12,
      ariaLabel: 40,
    };
    block.settingsFields.sort((a, b) => {
      const ga = groupRank[a.group] ?? 9;
      const gb = groupRank[b.group] ?? 9;
      if (ga !== gb) return ga - gb;
      return (pathRank[a.path.split('.').pop()] ?? 50) - (pathRank[b.path.split('.').pop()] ?? 50);
    });
  }
}

function enrichFeaturedCollection(schema) {
  const indexTpl = schema.templates?.find((t) => t.id === 'index');
  const sec = indexTpl?.sections?.find((s) => s.id === 'featured_collection');
  if (!sec) return;

  const base = 'templates.index.sections.featured_collection.settings';
  const schemes = [
    { value: 'scheme-1', label: 'Scheme 1' },
    { value: 'scheme-2', label: 'Scheme 2' },
    { value: 'scheme-3', label: 'Scheme 3' },
    { value: 'scheme-4', label: 'Scheme 4' },
  ];

  sec.label = 'Featured collection';
  sec.settingsFields = [
    field(`${base}.collectionHandle`, 'select', 'Collection', {
      group: 'Collection',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'products', label: 'Products' },
        { value: 'all', label: 'All products' },
        { value: 'featured', label: 'Featured' },
      ],
    }),
    field(`${base}.layoutType`, 'select', 'Type', {
      group: 'Collection',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'grid', label: 'Grid' },
        { value: 'carousel', label: 'Carousel' },
      ],
    }),
    field(`${base}.carouselOnMobile`, 'boolean', 'Carousel on mobile', {
      group: 'Collection',
      sidebar: false,
    }),
    field(`${base}.productsToShow`, 'number', 'Product count', {
      group: 'Collection',
      widget: 'slider',
      min: 1,
      max: 24,
      step: 1,
      sidebar: false,
    }),
    field(`${base}.columns`, 'number', 'Columns', {
      group: 'Collection',
      widget: 'slider',
      min: 1,
      max: 6,
      step: 1,
      sidebar: false,
    }),
    field(`${base}.mobileColumns`, 'select', 'Mobile columns', {
      group: 'Collection',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
      ],
    }),
    field(`${base}.horizontalGap`, 'number', 'Horizontal gap', {
      group: 'Collection',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.verticalGap`, 'number', 'Vertical gap', {
      group: 'Collection',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.sectionWidth`, 'select', 'Width', {
      group: 'Section layout',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
    }),
    field(`${base}.alignment`, 'select', 'Alignment', {
      group: 'Section layout',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    }),
    field(`${base}.sectionGap`, 'number', 'Gap', {
      group: 'Section layout',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.colorScheme`, 'select', 'Color scheme', {
      group: 'Section layout',
      widget: 'color-scheme',
      options: schemes,
      sidebar: false,
    }),
    field(`${base}.paddingTop`, 'number', 'Top', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.paddingBottom`, 'number', 'Bottom', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${base}.customCss`, 'textarea', 'Custom CSS', {
      group: 'Custom CSS',
      widget: 'accordion',
      sidebar: false,
    }),
    field(`${base}.subtitle`, 'textarea', 'Section subtitle (legacy)', {
      group: 'Collection',
      sidebar: false,
    }),
    field(`${base}.showRating`, 'boolean', 'Show ratings (legacy)', {
      group: 'Collection',
      sidebar: false,
    }),
    field(`${base}.emptyMessage`, 'text', 'Empty collection message', {
      group: 'Collection',
      sidebar: false,
    }),
  ];

  const groupRank = { Collection: 0, 'Section layout': 1, Padding: 2, 'Custom CSS': 3 };
  const pathRank = {
    collectionHandle: 0,
    layoutType: 1,
    carouselOnMobile: 2,
    productsToShow: 3,
    columns: 4,
    mobileColumns: 5,
    horizontalGap: 6,
    verticalGap: 7,
    sectionWidth: 10,
    alignment: 11,
    sectionGap: 12,
    colorScheme: 13,
    paddingTop: 20,
    paddingBottom: 21,
    customCss: 30,
    subtitle: 40,
    showRating: 41,
    emptyMessage: 42,
  };
  sec.settingsFields.sort((a, b) => {
    const ga = groupRank[a.group] ?? 5;
    const gb = groupRank[b.group] ?? 5;
    if (ga !== gb) return ga - gb;
    return (pathRank[a.path.split('.').pop()] ?? 50) - (pathRank[b.path.split('.').pop()] ?? 50);
  });

  const headerBlock = sec.blocks?.find((b) => b.id === 'collection_header');
  const productCardBlock = sec.blocks?.find((b) => b.id === 'product_card');

  if (productCardBlock) {
    enrichProductCardBlock(productCardBlock);
  }

  if (!headerBlock) return;

  const hb = 'templates.index.sections.featured_collection.blocks.collection_header.settings';
  const fitFillCustom = [
    { value: 'fit', label: 'Fit' },
    { value: 'fill', label: 'Fill' },
    { value: 'custom', label: 'Custom' },
  ];
  const alignOptions = [
    { value: 'space-between', label: 'Space between' },
    { value: 'flex-start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'flex-end', label: 'End' },
    { value: 'space-around', label: 'Space around' },
  ];
  const positionOptions = [
    { value: 'top', label: 'Top' },
    { value: 'center', label: 'Center' },
    { value: 'bottom', label: 'Bottom' },
  ];

  headerBlock.settingsFields = [
    field(`${hb}.subtitle`, 'text', 'Header subtitle', { group: 'Content', sidebar: false }),
    field(`${hb}.viewAllLabel`, 'text', 'View all label', { group: 'Content', sidebar: false }),
    field(`${hb}.viewAllHref`, 'text', 'View all link', { group: 'Content', sidebar: false }),
    field(`${hb}.direction`, 'select', 'Direction', {
      group: 'Layout',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'vertical', label: 'Vertical' },
        { value: 'horizontal', label: 'Horizontal' },
      ],
    }),
    field(`${hb}.verticalOnMobile`, 'boolean', 'Vertical on mobile', {
      group: 'Layout',
      sidebar: false,
    }),
    field(`${hb}.layoutAlignment`, 'select', 'Alignment', {
      group: 'Layout',
      widget: 'select',
      sidebar: false,
      options: alignOptions,
    }),
    field(`${hb}.position`, 'select', 'Position', {
      group: 'Layout',
      widget: 'select',
      sidebar: false,
      options: positionOptions,
    }),
    field(`${hb}.alignTextBaseline`, 'boolean', 'Align text baseline', {
      group: 'Layout',
      sidebar: false,
    }),
    field(`${hb}.layoutGap`, 'number', 'Gap', {
      group: 'Layout',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${hb}.width`, 'select', 'Width', {
      group: 'Size',
      widget: 'segmented',
      sidebar: false,
      options: fitFillCustom,
    }),
    field(`${hb}.mobileWidth`, 'select', 'Mobile width', {
      group: 'Size',
      widget: 'segmented',
      sidebar: false,
      options: fitFillCustom,
    }),
    field(`${hb}.height`, 'select', 'Height', {
      group: 'Size',
      widget: 'segmented',
      sidebar: false,
      options: fitFillCustom,
    }),
    field(`${hb}.inheritColorScheme`, 'boolean', 'Inherit color scheme', {
      group: 'Appearance',
      sidebar: false,
    }),
    field(`${hb}.backgroundMedia`, 'select', 'Background media', {
      group: 'Appearance',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'none', label: 'None' },
        { value: 'image', label: 'Image' },
      ],
    }),
    field(`${hb}.backgroundImageUrl`, 'text', 'Background image URL', {
      group: 'Appearance',
      sidebar: false,
      placeholder: 'https://…',
    }),
    field(`${hb}.borderStyle`, 'select', 'Borders', {
      group: 'Appearance',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
    }),
    field(`${hb}.cornerRadius`, 'number', 'Corner radius', {
      group: 'Appearance',
      widget: 'slider',
      min: 0,
      max: 40,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${hb}.paddingTop`, 'number', 'Top', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${hb}.paddingBottom`, 'number', 'Bottom', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${hb}.paddingLeft`, 'number', 'Left', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${hb}.paddingRight`, 'number', 'Right', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
  ];

  const hbGroupRank = { Content: 0, Layout: 1, Size: 2, Appearance: 3, Padding: 4 };
  enrichCollectionTitleBlock(headerBlock, hb);

  const hbPathRank = {
    subtitle: 0,
    viewAllLabel: 1,
    viewAllHref: 2,
    direction: 10,
    verticalOnMobile: 1,
    layoutAlignment: 2,
    position: 3,
    alignTextBaseline: 4,
    layoutGap: 5,
    width: 10,
    mobileWidth: 11,
    height: 12,
    inheritColorScheme: 20,
    backgroundMedia: 21,
    backgroundImageUrl: 22,
    borderStyle: 23,
    cornerRadius: 24,
    paddingTop: 30,
    paddingBottom: 31,
    paddingLeft: 32,
    paddingRight: 33,
  };
  headerBlock.settingsFields.sort((a, b) => {
    const ga = hbGroupRank[a.group] ?? 9;
    const gb = hbGroupRank[b.group] ?? 9;
    if (ga !== gb) return ga - gb;
    return (hbPathRank[a.path.split('.').pop()] ?? 50) - (hbPathRank[b.path.split('.').pop()] ?? 50);
  });
}

function enrichProductCardBlock(productCardBlock) {
  const pb = 'templates.index.sections.featured_collection.blocks.product_card.settings';

  productCardBlock.settingsFields = [
    field(`${pb}.verticalGap`, 'number', 'Vertical gap', {
      group: 'General',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${pb}.inheritColorScheme`, 'boolean', 'Inherit color scheme', {
      group: 'General',
      sidebar: false,
    }),
    field(`${pb}.borderStyle`, 'select', 'Style', {
      group: 'Borders',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
    }),
    field(`${pb}.cornerRadius`, 'number', 'Corner radius', {
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 40,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${pb}.paddingTop`, 'number', 'Top', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${pb}.paddingBottom`, 'number', 'Bottom', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${pb}.paddingLeft`, 'number', 'Left', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${pb}.paddingRight`, 'number', 'Right', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${pb}.showMedia`, 'boolean', 'Show media', { sidebar: false }),
    field(`${pb}.showTitle`, 'boolean', 'Show title', { sidebar: false }),
    field(`${pb}.showPrice`, 'boolean', 'Show price', { sidebar: false }),
  ];

  enrichProductCardMediaBlock(productCardBlock, pb);
  enrichProductCardTitleBlock(productCardBlock, pb);
  enrichProductCardPriceBlock(productCardBlock, pb);

  const groupRank = { General: 0, Borders: 1, Padding: 2 };
  const pathRank = {
    verticalGap: 0,
    inheritColorScheme: 1,
    borderStyle: 10,
    cornerRadius: 11,
    paddingTop: 20,
    paddingBottom: 21,
    paddingLeft: 22,
    paddingRight: 23,
  };
  productCardBlock.settingsFields = productCardBlock.settingsFields.filter((f) => {
    const key = f.path.split('.').pop();
    if (key === 'showMedia' || key === 'showTitle' || key === 'showPrice') return true;
    if (key?.startsWith('media') || key?.startsWith('productTitle') || key?.startsWith('price')) {
      return false;
    }
    return true;
  });
  productCardBlock.settingsFields.sort((a, b) => {
    const ga = groupRank[a.group] ?? 9;
    const gb = groupRank[b.group] ?? 9;
    if (ga !== gb) return ga - gb;
    return (pathRank[a.path.split('.').pop()] ?? 50) - (pathRank[b.path.split('.').pop()] ?? 50);
  });
}

function enrichProductCardMediaBlock(productCardBlock, pb) {
  const mediaBlock = productCardBlock.blocks?.find((b) => b.id === 'media');
  if (!mediaBlock) return;

  mediaBlock.settingsFields = [
    field(`${pb}.mediaAspectRatio`, 'select', 'Aspect ratio', {
      group: 'General',
      widget: 'select',
      sidebar: false,
      description: 'Adjusted in some layouts',
      options: [
        { value: 'auto', label: 'Auto' },
        { value: '1/1', label: 'Square (1:1)' },
        { value: '4/5', label: 'Portrait (4:5)' },
        { value: '3/4', label: 'Portrait (3:4)' },
        { value: '16/9', label: 'Landscape (16:9)' },
        { value: '2/3', label: 'Portrait (2:3)' },
      ],
    }),
    field(`${pb}.mediaBorderStyle`, 'select', 'Style', {
      group: 'Borders',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
    }),
    field(`${pb}.mediaCornerRadius`, 'number', 'Corner radius', {
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 40,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${pb}.mediaPaddingTop`, 'number', 'Top', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${pb}.mediaPaddingBottom`, 'number', 'Bottom', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${pb}.mediaPaddingLeft`, 'number', 'Left', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${pb}.mediaPaddingRight`, 'number', 'Right', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${pb}.showMedia`, 'boolean', 'Show media', { sidebar: false }),
  ];

  const groupRank = { General: 0, Borders: 1, Padding: 2 };
  const pathRank = {
    mediaAspectRatio: 0,
    mediaBorderStyle: 10,
    mediaCornerRadius: 11,
    mediaPaddingTop: 20,
    mediaPaddingBottom: 21,
    mediaPaddingLeft: 22,
    mediaPaddingRight: 23,
    showMedia: 40,
  };
  mediaBlock.settingsFields.sort((a, b) => {
    const ga = groupRank[a.group] ?? 9;
    const gb = groupRank[b.group] ?? 9;
    if (ga !== gb) return ga - gb;
    return (pathRank[a.path.split('.').pop()] ?? 50) - (pathRank[b.path.split('.').pop()] ?? 50);
  });
}

function enrichProductCardTitleBlock(productCardBlock, pb) {
  const titleBlock = productCardBlock.blocks?.find((b) => b.id === 'product_title');
  if (!titleBlock) return;

  titleBlock.settingsFields = [
    field(`${pb}.productTitleWidth`, 'select', 'Width', {
      group: 'Layout',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'fill', label: 'Fill' },
      ],
    }),
    field(`${pb}.productTitleMaxWidth`, 'select', 'Max width', {
      group: 'Layout',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'narrow', label: 'Narrow' },
        { value: 'normal', label: 'Normal' },
        { value: 'wide', label: 'Wide' },
        { value: 'none', label: 'None' },
      ],
    }),
    field(`${pb}.productTitleAlignment`, 'select', 'Alignment', {
      group: 'Layout',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    }),
    field(`${pb}.productTitleTypographyPreset`, 'select', 'Preset', {
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      description: 'Edit presets in theme settings',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'heading-1', label: 'Heading 1' },
        { value: 'heading-2', label: 'Heading 2' },
        { value: 'heading-3', label: 'Heading 3' },
        { value: 'heading-4', label: 'Heading 4' },
        { value: 'body', label: 'Body' },
      ],
    }),
    field(`${pb}.productTitleBackgroundEnabled`, 'boolean', 'Background', {
      group: 'Appearance',
      sidebar: false,
    }),
    field(`${pb}.productTitlePaddingTop`, 'number', 'Top', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${pb}.productTitlePaddingBottom`, 'number', 'Bottom', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${pb}.productTitlePaddingLeft`, 'number', 'Left', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${pb}.productTitlePaddingRight`, 'number', 'Right', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${pb}.showTitle`, 'boolean', 'Show title', { sidebar: false }),
  ];

  const groupRank = { Layout: 0, Typography: 1, Appearance: 2, Padding: 3 };
  const pathRank = {
    productTitleWidth: 0,
    productTitleMaxWidth: 1,
    productTitleAlignment: 2,
    productTitleTypographyPreset: 10,
    productTitleBackgroundEnabled: 20,
    productTitlePaddingTop: 30,
    productTitlePaddingBottom: 31,
    productTitlePaddingLeft: 32,
    productTitlePaddingRight: 33,
    showTitle: 40,
  };
  titleBlock.settingsFields.sort((a, b) => {
    const ga = groupRank[a.group] ?? 9;
    const gb = groupRank[b.group] ?? 9;
    if (ga !== gb) return ga - gb;
    return (pathRank[a.path.split('.').pop()] ?? 50) - (pathRank[b.path.split('.').pop()] ?? 50);
  });
}

function enrichProductCardPriceBlock(productCardBlock, pb) {
  const priceBlock = productCardBlock.blocks?.find((b) => b.id === 'price');
  if (!priceBlock) return;

  priceBlock.settingsFields = [
    field(`${pb}.priceShowSaleFirst`, 'boolean', 'Show sale price first', {
      group: 'General',
      sidebar: false,
      description: 'Edit price formatting in theme settings',
    }),
    field(`${pb}.priceInstallments`, 'boolean', 'Installments', {
      group: 'General',
      sidebar: false,
    }),
    field(`${pb}.priceTaxInfo`, 'boolean', 'Tax information', {
      group: 'General',
      sidebar: false,
    }),
    field(`${pb}.priceTypographyPreset`, 'select', 'Preset', {
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      description: 'Edit presets in theme settings',
      options: [
        { value: 'heading-6', label: 'Heading 6' },
        { value: 'heading-5', label: 'Heading 5' },
        { value: 'heading-4', label: 'Heading 4' },
        { value: 'default', label: 'Default' },
        { value: 'body', label: 'Body' },
      ],
    }),
    field(`${pb}.priceWidth`, 'select', 'Width', {
      group: 'Typography',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'fill', label: 'Fill' },
      ],
    }),
    field(`${pb}.priceAlignment`, 'select', 'Alignment', {
      group: 'Typography',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    }),
    field(`${pb}.priceColor`, 'select', 'Color', {
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'text', label: 'Text' },
        { value: 'heading', label: 'Heading' },
        { value: 'accent', label: 'Accent' },
        { value: 'muted', label: 'Muted' },
      ],
    }),
    field(`${pb}.pricePaddingTop`, 'number', 'Top', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${pb}.pricePaddingBottom`, 'number', 'Bottom', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${pb}.pricePaddingLeft`, 'number', 'Left', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${pb}.pricePaddingRight`, 'number', 'Right', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${pb}.showPrice`, 'boolean', 'Show price', { sidebar: false }),
  ];

  const groupRank = { General: 0, Typography: 1, Padding: 2 };
  const pathRank = {
    priceShowSaleFirst: 0,
    priceInstallments: 1,
    priceTaxInfo: 2,
    priceTypographyPreset: 10,
    priceWidth: 11,
    priceAlignment: 12,
    priceColor: 13,
    pricePaddingTop: 20,
    pricePaddingBottom: 21,
    pricePaddingLeft: 22,
    pricePaddingRight: 23,
    showPrice: 40,
  };
  priceBlock.settingsFields.sort((a, b) => {
    const ga = groupRank[a.group] ?? 9;
    const gb = groupRank[b.group] ?? 9;
    if (ga !== gb) return ga - gb;
    return (pathRank[a.path.split('.').pop()] ?? 50) - (pathRank[b.path.split('.').pop()] ?? 50);
  });
}

function enrichCollectionTitleBlock(headerBlock, hb) {
  const titleBlock = headerBlock.blocks?.find((b) => b.id === 'collection_title');
  if (!titleBlock) return;

  headerBlock.settingsFields = (headerBlock.settingsFields ?? []).filter(
    (f) => f.path.split('.').pop() !== 'title'
  );

  titleBlock.settingsFields = [
    field(`${hb}.title`, 'textarea', 'Text', {
      group: 'Text',
      widget: 'richtext',
      sidebar: false,
      description: 'Collection title shown in the header.',
    }),
    field(`${hb}.titleWidth`, 'select', 'Width', {
      group: 'Layout',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'fill', label: 'Fill' },
      ],
    }),
    field(`${hb}.titleMaxWidth`, 'select', 'Max width', {
      group: 'Layout',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'narrow', label: 'Narrow' },
        { value: 'normal', label: 'Normal' },
        { value: 'wide', label: 'Wide' },
        { value: 'none', label: 'None' },
      ],
    }),
    field(`${hb}.titleTypographyPreset`, 'select', 'Preset', {
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      description: 'Edit presets in theme settings',
      options: [
        { value: 'heading-1', label: 'Heading 1' },
        { value: 'heading-2', label: 'Heading 2' },
        { value: 'heading-3', label: 'Heading 3' },
        { value: 'heading-4', label: 'Heading 4' },
        { value: 'body', label: 'Body' },
      ],
    }),
    field(`${hb}.titleColor`, 'select', 'Color', {
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'text', label: 'Text' },
        { value: 'heading', label: 'Heading' },
        { value: 'accent', label: 'Accent' },
      ],
    }),
    field(`${hb}.titleBackgroundEnabled`, 'boolean', 'Background', {
      group: 'Appearance',
      sidebar: false,
    }),
    field(`${hb}.titlePaddingTop`, 'number', 'Top', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${hb}.titlePaddingBottom`, 'number', 'Bottom', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${hb}.titlePaddingLeft`, 'number', 'Left', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
    field(`${hb}.titlePaddingRight`, 'number', 'Right', {
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    }),
  ];

  const groupRank = { Text: 0, Layout: 1, Typography: 2, Appearance: 3, Padding: 4 };
  const pathRank = {
    title: 0,
    titleWidth: 1,
    titleMaxWidth: 2,
    titleTypographyPreset: 10,
    titleColor: 11,
    titleBackgroundEnabled: 20,
    titlePaddingTop: 30,
    titlePaddingBottom: 31,
    titlePaddingLeft: 32,
    titlePaddingRight: 33,
  };
  titleBlock.settingsFields.sort((a, b) => {
    const ga = groupRank[a.group] ?? 9;
    const gb = groupRank[b.group] ?? 9;
    if (ga !== gb) return ga - gb;
    return (pathRank[a.path.split('.').pop()] ?? 50) - (pathRank[b.path.split('.').pop()] ?? 50);
  });
}

function enrichSchemaMeta(schema) {
  schema.schemaVersion = '2.0.0';
  schema.themeId = 'horizon';
  schema.description =
    'Horizon benchmark theme schema — full editor tree for theme-packs/horizon. Use as reference when generating new theme packs.';
  schema.benchmark = true;
  schema.editorContract = {
    remoteThemePath: 'theme-packs/horizon',
    configMode: 'sections',
    configRoots: ['settings', 'sections', 'layout_order', 'templates'],
    previewBundle: 'create-theme/runtime',
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
    layoutSections: ['announcement_bar', 'header', 'divider', 'footer', 'footer_utilities'],
  };

  enrichAnnouncementBar(schema.layout);
  enrichHeader(schema.layout);
  enrichDivider(schema.layout);
  enrichFooter(schema.layout);
  enrichFooterUtilities(schema.layout);
  enrichHeroSection(schema);
  enrichFeaturedCollection(schema);
  enrichDividerTemplateSections(schema);

  for (const tpl of schema.templates || []) {
    tpl.description = tpl.description || `${tpl.label} template`;
    for (const sec of tpl.sections || []) {
      sec.hasBlocks = sec.hasBlocks ?? Boolean(sec.blocks?.length);
    }
  }
}

function enrichDefaultConfig(dc) {
  dc.themeId = 'horizon';
  dc.themeName = 'Horizon';
  dc.version = dc.version || '1.0.0';

  dc.settings = dc.settings || {};
  dc.settings.colors = {
    primary: '#111827',
    background: '#ffffff',
    text: '#111827',
    accent: '#4f46e5',
    surface: '#f9fafb',
    muted: '#6b7280',
    border: '#e5e7eb',
    ...dc.settings.colors,
  };
  dc.settings.typography = {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontFamilyBody: 'system-ui, -apple-system, sans-serif',
    baseSize: 16,
    lineHeight: 1.5,
    headingWeight: 600,
    ...dc.settings.typography,
  };
  dc.settings.spacing = {
    sectionGap: 48,
    contentMaxWidth: 1200,
    pagePadding: 24,
    ...dc.settings.spacing,
  };

  dc.layout_order = dc.layout_order || {
    header: ['announcement_bar', 'header'],
    footer: ['footer', 'footer_utilities'],
  };

  // Divider is opt-in only (added via "Add section"); do not ship a default layout instance.
  if (dc.sections?.divider) {
    delete dc.sections.divider;
  }

  const ab = dc.sections?.announcement_bar;
  if (ab?.settings) {
    ab.settings = {
      ...ab.settings,
      enabled: true,
      timeToNext: 5,
      sectionWidth: 'page',
      colorScheme: 'scheme-4',
      dividerThickness: 1,
      paddingTop: 15,
      paddingBottom: 15,
      customCss: '',
      message: 'Free shipping on orders over ₹999 — Shop the new collection',
      linkLabel: 'Shop now',
      linkHref: '/products',
    };
    ab.blocks = ab.blocks || {};
    const ann = ab.blocks.announcement || { type: 'announcement', settings: {} };
    const annText = ann.settings?.text ?? '';
    ann.settings = {
      ...ann.settings,
      text:
        !annText || /bloom/i.test(annText)
          ? ab.settings.message
          : annText,
    };
    ab.blocks.announcement = ann;
    ab.block_order = ab.block_order || ['announcement'];
    const blockSettings = ann.settings || {};
    ann.settings = {
      text: 'Welcome to our store',
      link: '',
      font: 'subheading',
      fontSize: '12px',
      fontWeight: 'default',
      letterSpacing: 'normal',
      textCase: 'default',
      ...blockSettings,
    };
  }

  const logo = dc.sections?.header?.blocks?.logo?.settings;
  if (logo) {
    if (!logo.text || logo.text === 'Bloom') logo.text = 'Horizon';
    if (!logo.tagline) logo.tagline = 'Soft essentials';
  }

  const menu = dc.sections?.header?.blocks?.menu?.settings?.items;
  if (Array.isArray(menu) && menu.length >= 3) {
    menu[0].label = menu[0].label || 'Shop';
    menu[1].label = menu[1].label || 'Collections';
    menu[2].label = menu[2].label || 'About';
  }

  const header = dc.sections?.header;
  if (header?.settings) {
    const stickyLegacy = header.settings.sticky === true;
    header.settings = {
      customerAccountMenu: 'customer-account',
      searchIcon: true,
      searchPosition: 'right',
      searchRow: 'top',
      searchPlaceholder: 'Search products…',
      countryRegionEnabled: true,
      showFlag: false,
      languageSelectorEnabled: true,
      localizationFont: 'heading',
      localizationSize: '14px',
      localizationPosition: 'right',
      localizationRow: 'top',
      sectionWidth: 'page',
      headerHeight: 'standard',
      stickyMode: stickyLegacy ? 'always' : 'never',
      borderThickness: 0,
      menuStyle: 'icons',
      colorScheme: 'scheme-1',
      homeTransparentBackground: false,
      productTransparentBackground: false,
      collectionTransparentBackground: false,
      defaultLogoUrl: '',
      cartType: 'drawer',
      productTitleCase: 'default',
      emptyCartLink: '/products',
      cartDrawerAutoOpen: false,
      cartLabel: 'Cart',
      customCss: '',
      ...header.settings,
    };
    delete header.settings.sticky;
    delete header.settings.showSearch;
  }
  if (header?.blocks?.logo?.settings) {
    header.blocks.logo.settings = {
      position: 'left',
      text: 'Horizon',
      tagline: 'Soft essentials',
      ...header.blocks.logo.settings,
    };
  }
  if (header?.blocks?.menu?.settings) {
    header.blocks.menu.settings = {
      position: 'left',
      row: 'top',
      ...header.blocks.menu.settings,
    };
  }

  const footer = dc.sections?.footer;
  if (footer) {
    const prevFooterSettings = footer.settings || {};
    footer.settings = {
      sectionWidth: 'page',
      gap: 20,
      colorScheme: 'scheme-1',
      paddingTop: 30,
      paddingBottom: 30,
      ...prevFooterSettings,
    };
    const newsletter = footer.blocks?.newsletter;
    if (newsletter) {
      const prev = newsletter.settings || {};
      newsletter.settings = {
        ...prev,
        blockWidth: 'fill',
        inheritColorScheme: true,
        title: '',
        headingTypographyPreset: prev.headingTypographyPreset ?? 'heading-3',
        inputBorder: 'all',
        inputBorderThickness: 1,
        inputCornerRadius: 100,
        inputTypographyPreset: prev.inputTypographyPreset ?? 'paragraph',
        submitStyle: 'link',
        submitDisplay: 'arrow',
        submitIntegratedButton: true,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        subtitle: '',
        placeholder: prev.placeholder ?? 'Email address',
        buttonLabel: prev.buttonLabel ?? 'Subscribe',
        privacyNote: prev.privacyNote ?? '',
      };
    }
  }

  const footerUtilities = dc.sections?.footer_utilities;
  if (footerUtilities) {
    footerUtilities.settings = {
      sectionWidth: 'page',
      gap: 24,
      dividerThickness: 0,
      colorScheme: 'scheme-1',
      paddingTop: 20,
      paddingBottom: 48,
      paymentIcons: false,
      followOnShop: false,
      customCss: '',
      ...(footerUtilities.settings || {}),
    };
    const copyright = footerUtilities.blocks?.copyright;
    if (copyright) {
      copyright.settings = {
        showPoweredBy: false,
        fontSize: '12px',
        textCase: 'default',
        text: '© 2026 My Store. All rights reserved.',
        ...(copyright.settings || {}),
      };
    }
    const policyLinks = footerUtilities.blocks?.policy_links;
    if (policyLinks) {
      policyLinks.settings = {
        fontSize: '12px',
        textCase: 'default',
        privacyLabel: 'Privacy policy',
        privacyHref: '/pages/privacy',
        termsLabel: 'Terms of service',
        termsHref: '/pages/terms',
        ...(policyLinks.settings || {}),
      };
    }
    const social = footerUtilities.blocks?.social;
    if (social) {
      const prev = social.settings || {};
      social.settings = {
        facebookUrl: prev.facebookUrl ?? prev.facebook ?? '',
        instagramUrl: prev.instagramUrl ?? prev.instagram ?? '',
        youtubeUrl: prev.youtubeUrl ?? '',
        tiktokUrl: prev.tiktokUrl ?? '',
        twitterUrl: prev.twitterUrl ?? '',
        threadsUrl: prev.threadsUrl ?? '',
        linkedinUrl: prev.linkedinUrl ?? '',
        blueskyUrl: prev.blueskyUrl ?? '',
        snapchatUrl: prev.snapchatUrl ?? '',
        pinterestUrl: prev.pinterestUrl ?? '',
        tumblrUrl: prev.tumblrUrl ?? '',
        vimeoUrl: prev.vimeoUrl ?? '',
        customUrl: prev.customUrl ?? '',
        ...prev,
      };
      delete social.settings.facebook;
      delete social.settings.instagram;
    }
  }

  const hero = dc.templates?.index?.sections?.hero_main;
  if (hero?.settings) {
    const legacy = hero.settings;
    hero.settings = {
      media1Type: 'image',
      media1ImageUrl: '',
      media2Type: 'image',
      media2ImageUrl: '',
      mobileStackMedia: false,
      mobileDifferentMedia: false,
      mobileImageUrl: '',
      sectionLink: '',
      sectionLinkNewTab: false,
      direction: 'vertical',
      alignTextBaseline: true,
      layoutAlignment: legacy.textAlign ?? 'center',
      position: 'center',
      layoutGap: 24,
      sectionWidth: legacy.fullWidth ? 'full' : 'page',
      height: 'small',
      colorScheme: 'scheme-6',
      mediaOverlay: true,
      overlayColor: '#12121266',
      overlayStyle: 'solid',
      blurredReflection: false,
      paddingTop: 56,
      paddingBottom: 56,
      customCss: '',
      title: 'Browse our latest products',
      headingWidth: 'fit',
      headingMaxWidth: 'normal',
      headingTypographyPreset: 'heading-2',
      headingColor: 'heading',
      headingBackgroundEnabled: false,
      headingPaddingTop: 0,
      headingPaddingBottom: 0,
      headingPaddingLeft: 0,
      headingPaddingRight: 0,
      eyebrow: 'Spring edit',
      subtitle: '',
      ...legacy,
      title: 'Browse our latest products',
      subtitle: '',
      position: 'center',
      height: 'small',
      paddingTop: 56,
      paddingBottom: 56,
    };
    const order = (hero.block_order ?? ['primary_button', 'secondary_button']).filter(
      (id) => id !== 'text_2'
    );
    hero.block_order = order.includes('heading') ? order : ['heading', ...order];
    if (hero.blocks?.text_2) {
      delete hero.blocks.text_2;
    }
  }

  for (const blockId of ['primary_button', 'secondary_button']) {
    const btn = dc.templates?.index?.sections?.hero_main?.blocks?.[blockId];
    if (btn?.settings) {
      btn.settings = {
        label: blockId === 'primary_button' ? 'Shop all' : 'Learn more',
        href: blockId === 'primary_button' ? '/products' : '/#about',
        openInNewTab: false,
        buttonStyle: blockId === 'primary_button' ? 'primary' : 'secondary',
        desktopWidth: 'fit',
        mobileWidth: 'fit',
        ariaLabel: '',
        ...btn.settings,
        label: blockId === 'primary_button' ? 'Shop all' : 'Learn more',
      };
    }
  }

  const fcHeader = dc.templates?.index?.sections?.featured_collection?.blocks?.collection_header;
  if (fcHeader?.settings) {
    fcHeader.settings = {
      ...fcHeader.settings,
      direction: 'horizontal',
      verticalOnMobile: false,
      layoutAlignment: 'left',
      position: 'bottom',
      alignTextBaseline: true,
      layoutGap: 12,
      width: 'fill',
      mobileWidth: 'fill',
      height: 'fit',
      inheritColorScheme: true,
      backgroundMedia: 'none',
      backgroundImageUrl: '',
      borderStyle: 'none',
      cornerRadius: 0,
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: 0,
      title: 'Products',
      titleWidth: 'fit',
      titleMaxWidth: 'normal',
      titleTypographyPreset: 'heading-2',
      titleColor: 'text',
      titleBackgroundEnabled: false,
      titlePaddingTop: 0,
      titlePaddingBottom: 0,
      titlePaddingLeft: 0,
      titlePaddingRight: 0,
      viewAllLabel: '',
      viewAllHref: '/products',
      subtitle: '',
    };
  }

  const fcProductCard = dc.templates?.index?.sections?.featured_collection?.blocks?.product_card;
  if (fcProductCard?.settings) {
    fcProductCard.settings = {
      ...fcProductCard.settings,
      verticalGap: 4,
      inheritColorScheme: true,
      borderStyle: 'none',
      cornerRadius: 0,
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: 0,
      mediaAspectRatio: '1/1',
      mediaBorderStyle: 'none',
      mediaCornerRadius: 0,
      mediaPaddingTop: 0,
      mediaPaddingBottom: 0,
      mediaPaddingLeft: 0,
      mediaPaddingRight: 0,
      productTitleWidth: 'fill',
      productTitleMaxWidth: 'normal',
      productTitleAlignment: 'left',
      productTitleTypographyPreset: 'body',
      productTitleBackgroundEnabled: false,
      productTitlePaddingTop: 4,
      productTitlePaddingBottom: 0,
      productTitlePaddingLeft: 0,
      productTitlePaddingRight: 0,
      priceShowSaleFirst: true,
      priceInstallments: false,
      priceTaxInfo: false,
      priceTypographyPreset: 'body',
      priceWidth: 'fill',
      priceAlignment: 'left',
      priceColor: 'text',
      pricePaddingTop: 0,
      pricePaddingBottom: 0,
      pricePaddingLeft: 0,
      pricePaddingRight: 0,
      showMedia: true,
      showTitle: true,
      showPrice: true,
    };
  }

  const fc = dc.templates?.index?.sections?.featured_collection;
  if (fc?.settings) {
    const legacyGap = fc.settings.gap;
    fc.settings = {
      ...fc.settings,
      collectionHandle: 'products',
      layoutType: 'grid',
      carouselOnMobile: false,
      productsToShow: 4,
      columns: 4,
      mobileColumns: '2',
      horizontalGap: legacyGap != null ? Math.min(48, Number(legacyGap) || 8) : 16,
      verticalGap: 24,
      sectionWidth: 'page',
      alignment: 'left',
      sectionGap: 28,
      colorScheme: 'scheme-1',
      paddingTop: 48,
      paddingBottom: 48,
      customCss: '',
      subtitle: '',
      showRating: false,
      emptyMessage: 'No products yet.',
    };
  }
}

function enrichManifest(manifest) {
  manifest.id = 'horizon';
  manifest.name = 'Horizon';
  manifest.benchmark = true;
  manifest.templates = [
    'index',
    'product',
    'cart',
    'login',
    'signup',
    'forgot_password',
    'profile',
    'orders',
    'preferences',
  ];
  manifest.sectionBlocks = {
    'announcement-bar': ['announcement'],
    hero: ['button', 'heading', 'text'],
    'featured-collection': ['product-card', 'title'],
    header: ['logo', 'menu'],
    footer: ['newsletter'],
    'footer-utilities': ['copyright', 'policy_links', 'social'],
    ...manifest.sectionBlocks,
  };
}

function main() {
  const schemaPath = path.join(SOURCE_PACK, 'theme.schema.json');
  const configPath = path.join(SOURCE_PACK, 'theme.default-config.json');
  const manifestPath = path.join(SOURCE_PACK, 'theme.manifest.json');

  const schema = readJson(schemaPath);
  const defaultConfig = readJson(configPath);
  const manifest = readJson(manifestPath);

  enrichSchemaMeta(schema);
  enrichDefaultConfig(defaultConfig);
  enrichManifest(manifest);

  const fieldCount = countFields(schema);

  for (const dir of TARGETS) {
    fs.mkdirSync(dir, { recursive: true });
    writeJson(path.join(dir, 'theme.schema.json'), schema);
    writeJson(path.join(dir, 'theme.default-config.json'), defaultConfig);
    writeJson(path.join(dir, 'theme.manifest.json'), manifest);
    console.log('wrote', dir);
  }

  console.log(`\nHorizon benchmark: ${fieldCount} editor field definitions, ${schema.templates?.length ?? 0} templates`);

  const gen = spawnSync(process.execPath, [path.join(__dirname, 'generate-section-editing-support.mjs')], {
    stdio: 'inherit',
    cwd: ROOT,
  });
  if (gen.status !== 0) {
    process.exit(gen.status ?? 1);
  }

  const master = spawnSync(process.execPath, [path.join(__dirname, 'generate-section-element-catalog.mjs')], {
    stdio: 'inherit',
    cwd: ROOT,
  });
  if (master.status !== 0) {
    process.exit(master.status ?? 1);
  }
}

main();
