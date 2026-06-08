/**
 * Build global section-editing-support.json from the Horizon benchmark schema.
 * Run after schema changes: node scripts/generate-section-editing-support.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCHEMA_PATH = path.join(ROOT, 'Ziplofy', 'src', 'theme-packs', 'horizon', 'theme.schema.json');
const OUT_PATH = path.join(ROOT, 'Ziplofy', 'src', 'theme-editor', 'section-editing-support.json');

/** Panel rules keyed by sectionType → blockId? → nestedId? → panelId */
const PANEL_RULES = {
  divider: {
    section: {
      default: {
        includeKeys: [
          'colorScheme',
          'sectionWidth',
          'thickness',
          'length',
          'paddingTop',
          'paddingBottom',
          'customCss',
        ],
        fieldOrder: [
          'colorScheme',
          'sectionWidth',
          'thickness',
          'length',
          'paddingTop',
          'paddingBottom',
          'customCss',
        ],
      },
    },
  },
  'announcement-bar': {
    section: {
      default: {
        includeGroups: ['General', 'Appearance', 'Padding', 'Custom CSS'],
        excludeGroups: ['Content'],
        fieldOrder: ['enabled', 'timeToNext', 'sectionWidth', 'colorScheme', 'dividerThickness', 'paddingTop', 'paddingBottom', 'customCss'],
      },
    },
    blocks: {
      announcement: {
        default: {
          includeGroups: ['Content', 'Typography'],
          fieldOrder: ['text', 'link', 'font', 'fontSize', 'fontWeight', 'letterSpacing', 'textCase'],
        },
      },
    },
  },
  header: {
    section: {
      default: {
        includeGroups: ['Logo', 'Menu', 'Customer account', 'Search', 'Localization', 'Appearance', 'Utilities', 'Colors', 'Page backgrounds', 'Theme settings', 'Custom CSS'],
        fieldOrder: [],
      },
    },
    blocks: {
      logo: {
        default: {
          includeKeys: ['hideLogoOnHomePage', 'paddingTop', 'paddingBottom'],
          fieldOrder: ['hideLogoOnHomePage', 'paddingTop', 'paddingBottom'],
        },
      },
      menu: {
        default: {
          includeKeys: [
            'menu',
            'colorScheme',
            'topLevelSize',
            'submenuSize',
            'font',
            'textCase',
            'submenuMediaType',
            'submenuImageRatio',
            'submenuImageCornerRadius',
            'mobileNavigationBar',
            'mobileAccordion',
            'mobileDividers',
          ],
          fieldOrder: [
            'menu',
            'colorScheme',
            'topLevelSize',
            'submenuSize',
            'font',
            'textCase',
            'submenuMediaType',
            'submenuImageRatio',
            'submenuImageCornerRadius',
            'mobileNavigationBar',
            'mobileAccordion',
            'mobileDividers',
          ],
        },
      },
    },
  },
  footer: {
    section: {
      default: {
        includeGroups: ['General', 'Padding', 'Custom CSS'],
        fieldOrder: ['sectionWidth', 'gap', 'colorScheme', 'paddingTop', 'paddingBottom', 'customCss'],
      },
    },
    blocks: {
      newsletter: {
        default: {
          includeKeys: [
            'signupsCustomerProfiles',
            'blockWidth',
            'inheritColorScheme',
            'title',
            'headingTypographyPreset',
            'inputBorder',
            'inputBorderThickness',
            'inputCornerRadius',
            'inputTypographyPreset',
            'submitStyle',
            'submitDisplay',
            'submitIntegratedButton',
            'paddingTop',
            'paddingBottom',
            'paddingLeft',
            'paddingRight',
          ],
          fieldOrder: [
            'signupsCustomerProfiles',
            'blockWidth',
            'inheritColorScheme',
            'title',
            'headingTypographyPreset',
            'inputBorder',
            'inputBorderThickness',
            'inputCornerRadius',
            'inputTypographyPreset',
            'submitStyle',
            'submitDisplay',
            'submitIntegratedButton',
            'paddingTop',
            'paddingBottom',
            'paddingLeft',
            'paddingRight',
          ],
        },
      },
    },
  },
  'footer-utilities': {
    section: {
      default: {
        includeGroups: ['General', 'Padding', 'Theme settings', 'Custom CSS'],
        fieldOrder: ['sectionWidth', 'gap', 'dividerThickness', 'colorScheme', 'paddingTop', 'paddingBottom', 'paymentIcons', 'followOnShop', 'customCss'],
      },
    },
    blocks: {
      copyright: {
        default: {
          includeKeys: ['showPoweredBy', 'manageStoreName', 'fontSize', 'textCase'],
          fieldOrder: ['showPoweredBy', 'manageStoreName', 'fontSize', 'textCase'],
        },
      },
      policy_links: {
        default: {
          includeKeys: ['managePolicies', 'fontSize', 'textCase'],
          fieldOrder: ['managePolicies', 'fontSize', 'textCase'],
        },
      },
      social: {
        default: {
          includeKeys: [
            'facebookUrl', 'instagramUrl', 'youtubeUrl', 'tiktokUrl', 'twitterUrl', 'threadsUrl',
            'linkedinUrl', 'blueskyUrl', 'snapchatUrl', 'pinterestUrl', 'tumblrUrl', 'vimeoUrl', 'customUrl',
          ],
          fieldOrder: [
            'facebookUrl', 'instagramUrl', 'youtubeUrl', 'tiktokUrl', 'twitterUrl', 'threadsUrl',
            'linkedinUrl', 'blueskyUrl', 'snapchatUrl', 'pinterestUrl', 'tumblrUrl', 'vimeoUrl', 'customUrl',
          ],
        },
      },
    },
  },
  hero: {
    section: {
      default: {
        includeGroups: ['Media 1', 'Media 2', 'Mobile media', 'Section link', 'Layout', 'Appearance', 'Padding', 'Custom CSS'],
        fieldOrder: [],
      },
    },
    blocks: {
      heading: {
        default: {
          includeGroups: ['Text', 'Layout', 'Typography', 'Appearance', 'Padding'],
          fieldOrder: [],
        },
      },
      primary_button: {
        default: {
          includeGroups: ['Content', 'Appearance', 'Size'],
          fieldOrder: [],
        },
      },
      secondary_button: {
        default: {
          includeGroups: ['Content', 'Appearance', 'Size'],
          fieldOrder: [],
        },
      },
    },
  },
  'featured-collection': {
    section: {
      default: {
        includeGroups: ['Collection', 'Section layout', 'Padding', 'Custom CSS'],
        fieldOrder: [
          'collectionHandle', 'layoutType', 'carouselOnMobile', 'productsToShow', 'columns', 'mobileColumns',
          'horizontalGap', 'verticalGap', 'sectionWidth', 'alignment', 'sectionGap', 'colorScheme',
          'paddingTop', 'paddingBottom', 'customCss',
        ],
      },
    },
    blocks: {
      collection_header: {
        default: {
          includeGroups: ['Layout', 'Typography', 'Appearance', 'Padding'],
          excludeKeys: ['titleWidth', 'titleMaxWidth', 'titleAlignment', 'titleTypographyPreset', 'titleColor', 'titleBackgroundEnabled', 'titlePaddingTop', 'titlePaddingBottom', 'titlePaddingLeft', 'titlePaddingRight', 'viewAllLabel', 'viewAllHref'],
          fieldOrder: ['headerWidth', 'headerAlignment', 'headerGap', 'title', 'showViewAll'],
        },
        nested: {
          collection_title: {
            default: {
              includeGroups: ['Text', 'Layout', 'Typography', 'Appearance', 'Padding'],
              includeKeys: ['title', 'titleWidth', 'titleMaxWidth', 'titleAlignment', 'titleTypographyPreset', 'titleColor', 'titleBackgroundEnabled', 'titlePaddingTop', 'titlePaddingBottom', 'titlePaddingLeft', 'titlePaddingRight'],
              fieldOrder: [],
            },
          },
          view_all_button: {
            default: {
              includeKeys: ['viewAllLabel', 'viewAllHref'],
              fieldOrder: ['viewAllLabel', 'viewAllHref'],
            },
          },
        },
      },
      product_card: {
        default: {
          includeGroups: ['General', 'Borders', 'Padding'],
          fieldOrder: ['verticalGap', 'inheritColorScheme', 'borderStyle', 'cornerRadius', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
        },
        nested: {
          media: {
            default: {
              includeKeys: ['mediaAspectRatio', 'mediaBorderStyle', 'mediaCornerRadius', 'mediaPaddingTop', 'mediaPaddingBottom', 'mediaPaddingLeft', 'mediaPaddingRight', 'showMedia'],
              fieldOrder: ['mediaAspectRatio', 'mediaBorderStyle', 'mediaCornerRadius', 'mediaPaddingTop', 'mediaPaddingBottom', 'mediaPaddingLeft', 'mediaPaddingRight', 'showMedia'],
            },
          },
          product_title: {
            default: {
              includeKeys: ['productTitleWidth', 'productTitleMaxWidth', 'productTitleAlignment', 'productTitleTypographyPreset', 'productTitleBackgroundEnabled', 'productTitlePaddingTop', 'productTitlePaddingBottom', 'productTitlePaddingLeft', 'productTitlePaddingRight', 'showTitle'],
              fieldOrder: [],
            },
          },
          price: {
            default: {
              includeKeys: ['priceShowSaleFirst', 'priceInstallments', 'priceTaxInfo', 'priceTypographyPreset', 'priceWidth', 'priceAlignment', 'priceColor', 'pricePaddingTop', 'pricePaddingBottom', 'pricePaddingLeft', 'pricePaddingRight', 'showPrice'],
              fieldOrder: [],
            },
          },
        },
      },
    },
  },
};

const LAYOUT_TYPE_MAP = {
  announcement_bar: 'announcement-bar',
  header: 'header',
  divider: 'divider',
  footer: 'footer',
  footer_utilities: 'footer-utilities',
};

function fieldKey(path) {
  return path?.split('.').pop() ?? '';
}

function toFieldDef(f) {
  const { path: _p, sidebar: _sidebar, ...rest } = f;
  return { key: fieldKey(f.path), ...rest };
}

/** PANEL_RULES nest panel config under `default`; unwrap for catalog `panels.default`. */
function unwrapPanelRule(rule) {
  if (!rule || typeof rule !== 'object') return rule;
  if (
    rule.default &&
    !rule.includeKeys &&
    !rule.includeGroups &&
    !rule.excludeKeys &&
    !rule.excludeGroups &&
    !rule.fieldOrder
  ) {
    return rule.default;
  }
  return rule;
}

function collectFields(settingsFields) {
  return (settingsFields ?? []).map(toFieldDef);
}

function buildBlockEntry(sectionType, block) {
  const blockId = block.id ?? block.label;
  const entry = {
    label: block.label ?? blockId,
    fields: collectFields(block.settingsFields),
  };
  const typeRules = PANEL_RULES[sectionType]?.blocks?.[blockId];
  if (block.blocks?.length) {
    entry.nested = {};
    for (const nested of block.blocks) {
      const nid = nested.id ?? nested.label;
      const nestedRule =
        unwrapPanelRule(typeRules?.nested?.[nid]) ??
        ({ includeKeys: collectFields(nested.settingsFields).map((f) => f.key) });
      entry.nested[nid] = {
        label: nested.label ?? nid,
        fields: collectFields(nested.settingsFields),
        panels: { default: nestedRule },
      };
    }
  }
  if (typeRules) {
    entry.panels = {};
    for (const [pid, rule] of Object.entries(typeRules)) {
      if (pid === 'nested') continue;
      entry.panels[pid] = unwrapPanelRule(rule);
    }
  } else {
    entry.panels = {
      default: { includeKeys: entry.fields.map((f) => f.key) },
    };
  }
  return entry;
}

function attachPanels(sectionType, sectionEntry) {
  const rules = PANEL_RULES[sectionType];
  if (rules?.section?.default) {
    sectionEntry.panels = { default: rules.section.default };
  } else {
    sectionEntry.panels = {
      default: { includeKeys: sectionEntry.fields.map((f) => f.key) },
    };
  }
}

function main() {
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  const sectionTypes = {};

  for (const [layoutKey, layout] of Object.entries(schema.layout ?? {})) {
    const type = LAYOUT_TYPE_MAP[layoutKey] ?? layoutKey;
    const entry = {
      label: layout.label ?? layoutKey,
      placement: ['layout'],
      layoutBlueprint: layoutKey,
      fields: collectFields(layout.settingsFields),
      blocks: {},
    };
    attachPanels(type, entry);
    for (const block of layout.blocks ?? []) {
      const bid = block.id ?? block.label;
      entry.blocks[bid] = buildBlockEntry(type, block);
    }
    sectionTypes[type] = entry;
  }

  for (const tpl of schema.templates ?? []) {
    for (const sec of tpl.sections ?? []) {
      const type = sec.type ?? sec.id;
      if (sectionTypes[type]) {
        if (!sectionTypes[type].placement.includes('template')) {
          sectionTypes[type].placement.push('template');
          sectionTypes[type].canonicalSectionId = sec.id;
          sectionTypes[type].canonicalTemplateId = tpl.id;
        }
        continue;
      }
      const entry = {
        label: sec.label ?? type,
        placement: ['template'],
        templateSectionType: type,
        canonicalSectionId: sec.id,
        canonicalTemplateId: tpl.id,
        fields: collectFields(sec.settingsFields),
        blocks: {},
      };
      attachPanels(type, entry);
      for (const block of sec.blocks ?? []) {
        const bid = block.id ?? block.label;
        entry.blocks[bid] = buildBlockEntry(type, block);
      }
      sectionTypes[type] = entry;
    }
  }

  const catalog = {
    version: 1,
    generatedFrom: 'Ziplofy/src/theme-packs/horizon/theme.schema.json',
    generatedAt: new Date().toISOString(),
    description:
      'Global editor support catalog: field definitions and panel rules per section type. Use when building theme sections and when resolving theme editor settings panels.',
    summary: {
      sectionTypeCount: Object.keys(sectionTypes).length,
      fieldCount: Object.values(sectionTypes).reduce((n, s) => {
        let c = s.fields.length;
        for (const b of Object.values(s.blocks ?? {})) {
          c += b.fields?.length ?? 0;
          for (const nb of Object.values(b.nested ?? {})) c += nb.fields?.length ?? 0;
        }
        return n + c;
      }, 0),
    },
    sectionTypes,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${OUT_PATH}`);
  console.log(`  ${catalog.summary.sectionTypeCount} section types, ${catalog.summary.fieldCount} field definitions`);
}

main();
