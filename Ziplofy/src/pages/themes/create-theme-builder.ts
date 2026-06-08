/**
 * Theme Creator data model — mirrors theme-packs/horizon shape so
 * generated schema + default-config work in the section theme editor.
 */
import {
  DEFAULT_TEXT_STYLE,
  defaultSectionAppearance,
  type SectionAppearance,
  type TextStyleSettings,
} from './create-theme-style.utils';

export type { SectionAppearance, TextStyleSettings };

export type BuilderSectionKind = 'announcement_bar' | 'hero_main' | 'product_cards' | 'footer';

export type EditorFieldDef = {
  key: string;
  type: 'text' | 'textarea' | 'boolean' | 'number';
  label: string;
};

export type ThemeGlobalSettings = {
  colors: { primary: string; background: string; text: string };
  typography: {
    fontFamily: string;
    fontFamilyBody: string;
    baseFontSize: number;
    headingFontWeight: 'normal' | 'bold';
    bodyFontStyle: 'normal' | 'italic';
    bodyTextDecoration: 'none' | 'underline';
    bodyTextTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  };
};

export type AnnouncementBarConfig = {
  kind: 'announcement_bar';
  enabled: boolean;
  message: string;
  linkLabel: string;
  linkHref: string;
  appearance: SectionAppearance;
};

export type HeroConfig = {
  kind: 'hero_main';
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryButtonLabel: string;
  primaryButtonHref: string;
  secondaryButtonLabel: string;
  secondaryButtonHref: string;
  appearance: SectionAppearance;
  eyebrowStyle: TextStyleSettings;
  titleStyle: TextStyleSettings;
  subtitleStyle: TextStyleSettings;
};

export type FeaturedCollectionConfig = {
  kind: 'product_cards';
  productsToShow: number;
  headerTitle: string;
  viewAllLabel: string;
  viewAllHref: string;
  showMedia: boolean;
  showTitle: boolean;
  showPrice: boolean;
  appearance: SectionAppearance;
  headerStyle: TextStyleSettings;
  viewAllStyle: TextStyleSettings;
};

export type FooterConfig = {
  kind: 'footer';
  title: string;
  subtitle: string;
  placeholder: string;
  buttonLabel: string;
  appearance: SectionAppearance;
  titleStyle: TextStyleSettings;
  subtitleStyle: TextStyleSettings;
};

export type SectionConfig = AnnouncementBarConfig | HeroConfig | FeaturedCollectionConfig | FooterConfig;

export type CanvasSection = { instanceId: string; config: SectionConfig };

const CANONICAL_BASE_ID: Record<BuilderSectionKind, string> = {
  announcement_bar: 'announcement_bar',
  hero_main: 'hero_main',
  product_cards: 'featured_collection',
  footer: 'footer',
};

export function defaultThemeGlobalSettings(): ThemeGlobalSettings {
  return {
    colors: { primary: '#111827', background: '#ffffff', text: '#111827' },
    typography: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontFamilyBody: 'system-ui, -apple-system, sans-serif',
      baseFontSize: 16,
      headingFontWeight: 'bold',
      bodyFontStyle: 'normal',
      bodyTextDecoration: 'none',
      bodyTextTransform: 'none',
    },
  };
}

export function defaultSectionConfig(kind: BuilderSectionKind): SectionConfig {
  switch (kind) {
    case 'announcement_bar':
      return {
        kind: 'announcement_bar',
        enabled: true,
        message: 'Free shipping on orders over ₹999 — Shop the new collection',
        linkLabel: 'Shop now',
        linkHref: '/products',
        appearance: defaultSectionAppearance({
          backgroundColor: '#0f172a',
          text: { ...DEFAULT_TEXT_STYLE, color: '#ffffff', fontSize: 12 },
        }),
      };
    case 'hero_main':
      return {
        kind: 'hero_main',
        eyebrow: 'New arrivals',
        title: 'Elevate your everyday',
        subtitle: 'Thoughtfully designed products for modern living — quality you can see and feel.',
        primaryButtonLabel: 'Shop collection',
        primaryButtonHref: '/products',
        secondaryButtonLabel: 'Learn more',
        secondaryButtonHref: '/#about',
        appearance: defaultSectionAppearance({ backgroundColor: '#ffffff' }),
        eyebrowStyle: { ...DEFAULT_TEXT_STYLE, fontSize: 12, textTransform: 'uppercase', color: '#6b7280' },
        titleStyle: { ...DEFAULT_TEXT_STYLE, fontSize: 36, fontWeight: 'bold' },
        subtitleStyle: { ...DEFAULT_TEXT_STYLE, fontSize: 14, color: '#4b5563' },
      };
    case 'product_cards':
      return {
        kind: 'product_cards',
        productsToShow: 8,
        headerTitle: 'Featured products',
        viewAllLabel: 'View all',
        viewAllHref: '/products',
        showMedia: true,
        showTitle: true,
        showPrice: true,
        appearance: defaultSectionAppearance({ backgroundColor: '#ffffff' }),
        headerStyle: { ...DEFAULT_TEXT_STYLE, fontSize: 24, fontWeight: 'bold' },
        viewAllStyle: { ...DEFAULT_TEXT_STYLE, fontSize: 14, color: '#2563eb' },
      };
    case 'footer':
      return {
        kind: 'footer',
        title: 'Join our exclusive email list',
        subtitle: 'Be the first to hear about new drops, offers, and styling tips.',
        placeholder: 'Enter your email',
        buttonLabel: 'Subscribe',
        appearance: defaultSectionAppearance({ backgroundColor: '#f3f4f6' }),
        titleStyle: { ...DEFAULT_TEXT_STYLE, fontSize: 18, fontWeight: 'bold' },
        subtitleStyle: { ...DEFAULT_TEXT_STYLE, fontSize: 14, color: '#4b5563' },
      };
  }
}

export function resolveInstanceId(kind: BuilderSectionKind, existing: CanvasSection[]): string {
  const base = CANONICAL_BASE_ID[kind];
  if (!existing.some((s) => s.instanceId === base)) return base;
  let n = 2;
  while (existing.some((s) => s.instanceId === `${base}_${n}`)) n += 1;
  return `${base}_${n}`;
}

export function editorFieldsForSection(config: SectionConfig): EditorFieldDef[] {
  switch (config.kind) {
    case 'announcement_bar':
      return [
        { key: 'enabled', type: 'boolean', label: 'Show announcement' },
        { key: 'message', type: 'text', label: 'Announcement text' },
        { key: 'linkLabel', type: 'text', label: 'Link label' },
        { key: 'linkHref', type: 'text', label: 'Link URL' },
      ];
    case 'hero_main':
      return [
        { key: 'eyebrow', type: 'text', label: 'Eyebrow' },
        { key: 'title', type: 'text', label: 'Heading' },
        { key: 'subtitle', type: 'textarea', label: 'Text' },
        { key: 'primaryButtonLabel', type: 'text', label: 'Primary button label' },
        { key: 'primaryButtonHref', type: 'text', label: 'Primary button link' },
        { key: 'secondaryButtonLabel', type: 'text', label: 'Secondary button label' },
        { key: 'secondaryButtonHref', type: 'text', label: 'Secondary button link' },
      ];
    case 'product_cards':
      return [
        { key: 'productsToShow', type: 'number', label: 'Products to show' },
        { key: 'headerTitle', type: 'text', label: 'Section title' },
        { key: 'viewAllLabel', type: 'text', label: 'View all button' },
        { key: 'viewAllHref', type: 'text', label: 'View all link' },
        { key: 'showMedia', type: 'boolean', label: 'Show media' },
        { key: 'showTitle', type: 'boolean', label: 'Show title' },
        { key: 'showPrice', type: 'boolean', label: 'Show price' },
      ];
    case 'footer':
      return [
        { key: 'title', type: 'text', label: 'Heading' },
        { key: 'subtitle', type: 'textarea', label: 'Subtext' },
        { key: 'placeholder', type: 'text', label: 'Email placeholder' },
        { key: 'buttonLabel', type: 'text', label: 'Button label' },
      ];
  }
}

export function patchSectionConfig(
  config: SectionConfig,
  key: string,
  value: string | boolean | number
): SectionConfig {
  return { ...config, [key]: value } as SectionConfig;
}

function schemaTextStyleFields(pathPrefix: string, label: string): Array<{ path: string; type: string; label: string }> {
  return [
    { path: `${pathPrefix}.color`, type: 'color', label: `${label} color` },
    { path: `${pathPrefix}.fontSize`, type: 'number', label: `${label} font size` },
    { path: `${pathPrefix}.fontWeight`, type: 'text', label: `${label} bold` },
    { path: `${pathPrefix}.fontStyle`, type: 'text', label: `${label} italic` },
    { path: `${pathPrefix}.textDecoration`, type: 'text', label: `${label} underline` },
    { path: `${pathPrefix}.textTransform`, type: 'text', label: `${label} letter case` },
  ];
}

function schemaSectionStyleFields(pathPrefix: string): Array<{ path: string; type: string; label: string }> {
  return [
    { path: `${pathPrefix}.backgroundColor`, type: 'color', label: 'Background color' },
    ...schemaTextStyleFields(`${pathPrefix}.text`, 'Text'),
  ];
}

function serializeTextStyle(style: TextStyleSettings): Record<string, unknown> {
  return { ...style };
}

function serializeSectionStyle(appearance: SectionAppearance): Record<string, unknown> {
  return {
    backgroundColor: appearance.backgroundColor,
    text: serializeTextStyle(appearance.text),
  };
}

function buildGlobalSettingsSchema(): Record<string, unknown> {
  return {
    label: 'Theme settings',
    groups: [
      {
        id: 'colors',
        label: 'Colors',
        fields: [
          { path: 'settings.colors.primary', type: 'color', label: 'Primary' },
          { path: 'settings.colors.background', type: 'color', label: 'Background' },
          { path: 'settings.colors.text', type: 'color', label: 'Text' },
        ],
      },
      {
        id: 'typography',
        label: 'Typography',
        fields: [
          { path: 'settings.typography.fontFamily', type: 'text', label: 'Heading font' },
          { path: 'settings.typography.fontFamilyBody', type: 'text', label: 'Body font' },
          { path: 'settings.typography.baseFontSize', type: 'number', label: 'Base font size' },
          { path: 'settings.typography.headingFontWeight', type: 'text', label: 'Heading weight' },
          { path: 'settings.typography.bodyFontStyle', type: 'text', label: 'Body italic' },
          { path: 'settings.typography.bodyTextDecoration', type: 'text', label: 'Body underline' },
          { path: 'settings.typography.bodyTextTransform', type: 'text', label: 'Body letter case' },
        ],
      },
    ],
  };
}

export function buildSchemaJson(
  canvasSections: CanvasSection[],
  themeId: string,
  _global?: ThemeGlobalSettings
): Record<string, unknown> {
  const layout: Record<string, unknown> = {};
  const indexSections: Array<Record<string, unknown>> = [];

  canvasSections.forEach(({ instanceId, config }) => {
    if (config.kind === 'announcement_bar') {
      const p = `sections.${instanceId}.settings`;
      layout[instanceId] = {
        label: 'Announcement bar',
        settingsFields: [
          { path: `${p}.enabled`, type: 'boolean', label: 'Show announcement' },
          { path: `${p}.message`, type: 'text', label: 'Announcement text' },
          { path: `${p}.linkLabel`, type: 'text', label: 'Link label' },
          { path: `${p}.linkHref`, type: 'text', label: 'Link URL' },
          ...schemaSectionStyleFields(`${p}.style`),
        ],
      };
    }
    if (config.kind === 'footer') {
      const bp = `sections.${instanceId}.blocks.newsletter.settings`;
      layout[instanceId] = {
        label: 'Footer',
        blocks: [
          {
            id: 'newsletter',
            label: 'Email signup',
            settingsFields: [
              { path: `${bp}.placeholder`, type: 'text', label: 'Email placeholder' },
              ...schemaSectionStyleFields(`sections.${instanceId}.settings.style`),
            ],
          },
        ],
      };
    }
    if (config.kind === 'hero_main') {
      const p = `templates.index.sections.${instanceId}.settings`;
      indexSections.push({
        id: instanceId,
        type: 'hero',
        label: 'Hero',
        hasBlocks: true,
        settingsFields: [
          { path: `${p}.eyebrow`, type: 'text', label: 'Eyebrow' },
          { path: `${p}.title`, type: 'text', label: 'Heading' },
          { path: `${p}.subtitle`, type: 'textarea', label: 'Text' },
          ...schemaSectionStyleFields(`${p}.style`),
          ...schemaTextStyleFields(`${p}.eyebrowStyle`, 'Eyebrow'),
          ...schemaTextStyleFields(`${p}.titleStyle`, 'Heading'),
          ...schemaTextStyleFields(`${p}.subtitleStyle`, 'Body'),
        ],
        blocks: [
          {
            id: 'primary_button',
            label: 'Primary button',
            settingsFields: [
              { path: `templates.index.sections.${instanceId}.blocks.primary_button.settings.label`, type: 'text', label: 'Button label' },
              { path: `templates.index.sections.${instanceId}.blocks.primary_button.settings.href`, type: 'text', label: 'Button link' },
            ],
          },
          {
            id: 'secondary_button',
            label: 'Secondary button',
            settingsFields: [
              { path: `templates.index.sections.${instanceId}.blocks.secondary_button.settings.label`, type: 'text', label: 'Button label' },
              { path: `templates.index.sections.${instanceId}.blocks.secondary_button.settings.href`, type: 'text', label: 'Button link' },
            ],
          },
        ],
      });
    }
    if (config.kind === 'product_cards') {
      const p = `templates.index.sections.${instanceId}.settings`;
      const hp = `templates.index.sections.${instanceId}.blocks.collection_header.settings`;
      indexSections.push({
        id: instanceId,
        type: 'featured-collection',
        label: 'Featured collection',
        hasBlocks: true,
        settingsFields: [
          { path: `${p}.productsToShow`, type: 'number', label: 'Products to show' },
          ...schemaSectionStyleFields(`${p}.style`),
          ...schemaTextStyleFields(`${hp}.headerStyle`, 'Title'),
          ...schemaTextStyleFields(`${hp}.viewAllStyle`, 'View all link'),
        ],
        blocks: [
          {
            id: 'collection_header',
            label: 'Header',
            blocks: [
              {
                id: 'collection_title',
                label: 'Collection title',
                settingsFields: [{ path: `${hp}.title`, type: 'text', label: 'Text' }],
              },
              {
                id: 'view_all_button',
                label: 'View all button',
                settingsFields: [
                  { path: `${hp}.viewAllLabel`, type: 'text', label: 'Label' },
                  { path: `${hp}.viewAllHref`, type: 'text', label: 'Link' },
                ],
              },
            ],
          },
          {
            id: 'product_card',
            label: 'Product card',
            blocks: [
              {
                id: 'media',
                label: 'Media',
                settingsFields: [
                  {
                    path: `templates.index.sections.${instanceId}.blocks.product_card.settings.showMedia`,
                    type: 'boolean',
                    label: 'Visible',
                  },
                ],
              },
              {
                id: 'product_title',
                label: 'Product title',
                settingsFields: [
                  {
                    path: `templates.index.sections.${instanceId}.blocks.product_card.settings.showTitle`,
                    type: 'boolean',
                    label: 'Visible',
                  },
                ],
              },
              {
                id: 'price',
                label: 'Price',
                settingsFields: [
                  {
                    path: `templates.index.sections.${instanceId}.blocks.product_card.settings.showPrice`,
                    type: 'boolean',
                    label: 'Visible',
                  },
                ],
              },
            ],
          },
        ],
      });
    }
  });

  return {
    version: '1.0.0',
    themeId,
    description: 'Theme generated from Ziplofy Theme Creator',
    globalSettings: buildGlobalSettingsSchema(),
    layout,
    templates: [{ id: 'index', label: 'Home page', sections: indexSections }],
  };
}

export function buildDefaultConfigJson(
  canvasSections: CanvasSection[],
  themeId: string,
  themeName: string,
  global: ThemeGlobalSettings
): Record<string, unknown> {
  const sections: Record<string, unknown> = {};
  const indexSections: Record<string, unknown> = {};
  const indexOrder: string[] = [];

  canvasSections.forEach(({ instanceId, config }) => {
    if (config.kind === 'announcement_bar') {
      sections[instanceId] = {
        id: instanceId,
        type: 'announcement-bar',
        enabled: config.enabled,
        settings: {
          enabled: config.enabled,
          message: config.message,
          linkLabel: config.linkLabel,
          linkHref: config.linkHref,
          style: serializeSectionStyle(config.appearance),
        },
      };
    }
    if (config.kind === 'footer') {
      sections[instanceId] = {
        id: instanceId,
        type: 'footer',
        enabled: true,
        settings: { style: serializeSectionStyle(config.appearance) },
        blocks: {
          newsletter: {
            type: 'newsletter',
            settings: {
              title: '',
              subtitle: '',
              placeholder: config.placeholder,
              buttonLabel: '',
              titleStyle: serializeTextStyle(config.titleStyle),
              subtitleStyle: serializeTextStyle(config.subtitleStyle),
            },
          },
        },
        block_order: ['newsletter'],
      };
    }
    if (config.kind === 'hero_main') {
      indexSections[instanceId] = {
        type: 'hero',
        enabled: true,
        settings: {
          eyebrow: config.eyebrow,
          title: config.title,
          subtitle: config.subtitle,
          style: serializeSectionStyle(config.appearance),
          eyebrowStyle: serializeTextStyle(config.eyebrowStyle),
          titleStyle: serializeTextStyle(config.titleStyle),
          subtitleStyle: serializeTextStyle(config.subtitleStyle),
        },
        blocks: {
          primary_button: {
            type: 'button',
            settings: { label: config.primaryButtonLabel, href: config.primaryButtonHref },
          },
          secondary_button: {
            type: 'button',
            settings: { label: config.secondaryButtonLabel, href: config.secondaryButtonHref },
          },
        },
        block_order: ['primary_button', 'secondary_button'],
      };
      indexOrder.push(instanceId);
    }
    if (config.kind === 'product_cards') {
      indexSections[instanceId] = {
        type: 'featured-collection',
        enabled: true,
        settings: {
          productsToShow: config.productsToShow,
          style: serializeSectionStyle(config.appearance),
        },
        blocks: {
          collection_header: {
            type: 'collection-header',
            settings: {
              title: config.headerTitle,
              viewAllLabel: config.viewAllLabel,
              viewAllHref: config.viewAllHref,
              headerStyle: serializeTextStyle(config.headerStyle),
              viewAllStyle: serializeTextStyle(config.viewAllStyle),
            },
            nested_block_order: ['collection_title', 'view_all_button'],
          },
          product_card: {
            type: 'product-card',
            settings: {
              showMedia: config.showMedia,
              showTitle: config.showTitle,
              showPrice: config.showPrice,
            },
            nested_block_order: ['media', 'product_title', 'price'],
          },
        },
        block_order: ['collection_header', 'product_card'],
      };
      indexOrder.push(instanceId);
    }
  });

  return {
    version: '1.0.0',
    themeId,
    themeName,
    settings: {
      colors: { ...global.colors },
      typography: { ...global.typography },
    },
    sections,
    templates: {
      index: {
        name: 'Home page',
        sections: indexSections,
        section_order: indexOrder,
      },
    },
  };
}
