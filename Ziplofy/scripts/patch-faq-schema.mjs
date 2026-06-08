import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packDir = path.join(__dirname, '../src/theme-packs/horizon');
const previewDir = path.join(packDir, 'preview');
const schemaPath = path.join(packDir, 'theme.schema.json');
const previewSchemaPath = path.join(previewDir, 'theme.schema.json');
const defaultPath = path.join(packDir, 'theme.default-config.json');
const previewDefaultPath = path.join(previewDir, 'theme.default-config.json');
const manifestPath = path.join(packDir, 'theme.manifest.json');
const previewManifestPath = path.join(previewDir, 'theme.manifest.json');

const COLOR_SCHEME_OPTIONS = [
  { value: 'scheme-1', label: 'Scheme 1' },
  { value: 'scheme-2', label: 'Scheme 2' },
  { value: 'scheme-3', label: 'Scheme 3' },
  { value: 'scheme-4', label: 'Scheme 4' },
];

/** Section settings: Layout → Size → Appearance → Padding → Custom CSS (heading lives in Heading block). */
function sectionSettingsFields(prefix) {
  return [
    {
      path: `${prefix}.direction`,
      type: 'select',
      label: 'Direction',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'vertical', label: 'Vertical' },
        { value: 'horizontal', label: 'Horizontal' },
      ],
    },
    {
      path: `${prefix}.layoutAlignment`,
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
    {
      path: `${prefix}.position`,
      type: 'select',
      label: 'Position',
      group: 'Layout',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'top', label: 'Top' },
        { value: 'center', label: 'Center' },
        { value: 'bottom', label: 'Bottom' },
      ],
    },
    {
      path: `${prefix}.layoutGap`,
      type: 'number',
      label: 'Gap',
      group: 'Layout',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: `${prefix}.sectionWidth`,
      type: 'select',
      label: 'Width',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
    },
    {
      path: `${prefix}.height`,
      type: 'select',
      label: 'Height',
      group: 'Size',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'auto', label: 'Auto' },
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
    },
    {
      path: `${prefix}.colorScheme`,
      type: 'select',
      label: 'Color scheme',
      group: 'Appearance',
      widget: 'color-scheme',
      sidebar: true,
      options: COLOR_SCHEME_OPTIONS,
    },
    {
      path: `${prefix}.backgroundMedia`,
      type: 'select',
      label: 'Background media',
      group: 'Appearance',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'image', label: 'Image' },
      ],
    },
    {
      path: `${prefix}.backgroundImageUrl`,
      type: 'text',
      label: 'Background image',
      group: 'Appearance',
      sidebar: true,
      placeholder: 'Paste image URL or upload',
    },
    {
      path: `${prefix}.borderStyle`,
      type: 'select',
      label: 'Borders',
      group: 'Appearance',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
    },
    {
      path: `${prefix}.cornerRadius`,
      type: 'number',
      label: 'Corner radius',
      group: 'Appearance',
      widget: 'slider',
      min: 0,
      max: 40,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: `${prefix}.backgroundOverlay`,
      type: 'boolean',
      label: 'Background overlay',
      group: 'Appearance',
      sidebar: true,
    },
    {
      path: `${prefix}.paddingTop`,
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: `${prefix}.paddingBottom`,
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: `${prefix}.customCss`,
      type: 'textarea',
      label: 'Custom CSS',
      group: 'Custom CSS',
      widget: 'accordion',
      sidebar: true,
    },
  ];
}

function accordionBlockSettingsFields(prefix) {
  const s = (key) => `${prefix}.blocks.accordion.settings.${key}`;
  return [
    {
      path: s('icon'),
      type: 'select',
      label: 'Icon',
      group: 'General',
      widget: 'segmented',
      options: [
        { value: 'caret', label: 'Caret' },
        { value: 'plus', label: 'Plus' },
      ],
      sidebar: true,
    },
    {
      path: s('dividers'),
      type: 'boolean',
      label: 'Dividers',
      group: 'General',
      sidebar: true,
    },
    {
      path: s('headingTypographyPreset'),
      type: 'select',
      label: 'Heading preset',
      group: 'General',
      widget: 'select',
      description: 'Edit presets in theme settings',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'paragraph', label: 'Paragraph' },
        { value: 'heading-1', label: 'Heading 1' },
        { value: 'heading-2', label: 'Heading 2' },
        { value: 'heading-3', label: 'Heading 3' },
        { value: 'heading-4', label: 'Heading 4' },
        { value: 'heading-5', label: 'Heading 5' },
        { value: 'heading-6', label: 'Heading 6' },
      ],
      sidebar: true,
    },
    {
      path: s('inheritColorScheme'),
      type: 'boolean',
      label: 'Inherit color scheme',
      group: 'General',
      sidebar: true,
    },
    {
      path: s('borderStyle'),
      type: 'select',
      label: 'Style',
      group: 'Borders',
      widget: 'segmented',
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
      sidebar: true,
    },
    {
      path: s('cornerRadius'),
      type: 'number',
      label: 'Corner radius',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 40,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingTop'),
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingBottom'),
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingLeft'),
      type: 'number',
      label: 'Left',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingRight'),
      type: 'number',
      label: 'Right',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
  ];
}

function textBlockSettingsFields(blockPrefix) {
  const s = (key) => `${blockPrefix}.settings.${key}`;
  return [
    {
      path: s('text'),
      type: 'textarea',
      label: 'Text',
      group: 'Text',
      widget: 'richtext',
      sidebar: true,
    },
    {
      path: s('width'),
      type: 'select',
      label: 'Width',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'fill', label: 'Fill' },
      ],
    },
    {
      path: s('maxWidth'),
      type: 'select',
      label: 'Max width',
      group: 'Layout',
      widget: 'select',
      sidebar: true,
      options: [
        { value: 'narrow', label: 'Narrow' },
        { value: 'normal', label: 'Normal' },
        { value: 'wide', label: 'Wide' },
        { value: 'none', label: 'None' },
      ],
    },
    {
      path: s('alignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
    {
      path: s('typographyPreset'),
      type: 'select',
      label: 'Preset',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      description: 'Edit presets in theme settings',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'paragraph', label: 'Paragraph' },
        { value: 'body', label: 'Body' },
        { value: 'heading-1', label: 'Heading 1' },
        { value: 'heading-2', label: 'Heading 2' },
        { value: 'heading-3', label: 'Heading 3' },
        { value: 'heading-4', label: 'Heading 4' },
        { value: 'heading-5', label: 'Heading 5' },
        { value: 'heading-6', label: 'Heading 6' },
      ],
    },
    {
      path: s('backgroundEnabled'),
      type: 'boolean',
      label: 'Background',
      group: 'Appearance',
      sidebar: true,
    },
    {
      path: s('paddingTop'),
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingBottom'),
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingLeft'),
      type: 'number',
      label: 'Left',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingRight'),
      type: 'number',
      label: 'Right',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
  ];
}

function defaultTextBlockSettings(text = '') {
  return {
    text,
    width: 'fill',
    maxWidth: 'normal',
    alignment: 'left',
    typographyPreset: 'default',
    backgroundEnabled: false,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  };
}

function faqBlocks(prefix) {
  return [
    {
      id: 'heading',
      label: 'Heading',
      settingsFields: [],
    },
    {
      id: 'accordion',
      label: 'Accordion',
      settingsFields: accordionBlockSettingsFields(prefix),
      blocks: [
        {
          id: 'accordion_row',
          label: 'Accordion row',
          settingsFields: [
            {
              path: `${prefix}.blocks.accordion.blocks.accordion_row.settings.heading`,
              type: 'text',
              label: 'Heading',
              group: 'Content',
              sidebar: true,
            },
            {
              path: `${prefix}.blocks.accordion.blocks.accordion_row.settings.openByDefault`,
              type: 'boolean',
              label: 'Open row by default',
              group: 'Content',
              sidebar: true,
            },
            {
              path: `${prefix}.blocks.accordion.blocks.accordion_row.settings.rowIcon`,
              type: 'select',
              label: 'Icon',
              group: 'Icon',
              widget: 'select',
              sidebar: true,
              options: [{ value: 'none', label: 'None' }],
            },
            {
              path: `${prefix}.blocks.accordion.blocks.accordion_row.settings.rowImageIconUrl`,
              type: 'text',
              label: 'Image icon',
              group: 'Icon',
              sidebar: true,
            },
            {
              path: `${prefix}.blocks.accordion.blocks.accordion_row.settings.rowIconWidth`,
              type: 'number',
              label: 'Width',
              group: 'Icon',
              widget: 'slider',
              min: 8,
              max: 64,
              step: 1,
              unit: 'px',
              sidebar: true,
            },
          ],
          blocks: [
            {
              id: 'text',
              label: 'Text',
              settingsFields: textBlockSettingsFields(
                `${prefix}.blocks.accordion.blocks.accordion_row.blocks.text`
              ),
            },
          ],
        },
      ],
    },
  ];
}

const layoutFaq = {
  label: 'FAQ',
  description: 'Accordion frequently asked questions.',
  settingsFields: sectionSettingsFields('sections.faq_section.settings'),
  blocks: faqBlocks('sections.faq_section'),
};

const templateFaq = {
  id: 'faq_section',
  type: 'faq',
  label: 'FAQ',
  hasBlocks: true,
  settingsFields: sectionSettingsFields('templates.index.sections.faq_section.settings'),
  blocks: faqBlocks('templates.index.sections.faq_section'),
};

const defaultRows = [
  ['What is the return policy?', 'We offer a 30-day return policy on most items. Products must be unused and in original packaging.'],
  ['Are any purchases final sale?', 'Yes, items marked final sale cannot be returned or exchanged.'],
  ['When will I get my order?', 'Most orders ship within 2–3 business days. Delivery times vary by location.'],
  ['Where are your products manufactured?', 'Our products are designed in-house and manufactured with trusted partners worldwide.'],
  ['How much does shipping cost?', 'Shipping is calculated at checkout. Free shipping may apply on qualifying orders.'],
];

function buildDefaultFaqSection() {
  const rowBlocks = {};
  const rowOrder = [];
  defaultRows.forEach(([question, answer], i) => {
    const id = `row_${i + 1}`;
    rowBlocks[id] = {
      type: 'accordion-row',
      settings: {
        heading: question,
        openByDefault: false,
        rowIcon: 'none',
        rowImageIconUrl: '',
        rowIconWidth: 20,
      },
      block_order: ['text'],
      blocks: {
        text: { type: 'text', settings: defaultTextBlockSettings(answer) },
      },
    };
    rowOrder.push(id);
  });
  return {
    type: 'faq',
    enabled: true,
    settings: {
      catalogVariant: 'faq',
      direction: 'vertical',
      layoutAlignment: 'left',
      position: 'center',
      layoutGap: 32,
      sectionWidth: 'page',
      height: 'auto',
      colorScheme: 'scheme-1',
      backgroundMedia: 'none',
      backgroundImageUrl: '',
      borderStyle: 'none',
      cornerRadius: 0,
      backgroundOverlay: false,
      paddingTop: 48,
      paddingBottom: 48,
      customCss: '',
      title: 'Frequently asked questions',
      headingWidth: 'fit',
      headingMaxWidth: 'normal',
      headingAlignment: 'left',
      headingTypographyPreset: 'heading-2',
      headingFont: 'body',
      headingFontSize: '16px',
      headingLineHeight: 'normal',
      headingLetterSpacing: 'normal',
      headingTextCase: 'default',
      headingWrap: 'pretty',
      headingColor: 'heading',
      headingBackgroundEnabled: false,
      headingBackgroundColor: '#00000026',
      headingCornerRadius: 0,
      headingPaddingTop: 0,
      headingPaddingBottom: 0,
      headingPaddingLeft: 0,
      headingPaddingRight: 0,
    },
    blocks: {
      heading: {
        type: 'heading',
        settings: { heading: 'Frequently asked questions' },
      },
      accordion: {
        type: 'group',
        settings: {
          icon: 'caret',
          dividers: true,
          headingTypographyPreset: 'heading-5',
          inheritColorScheme: false,
          borderStyle: 'none',
          cornerRadius: 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          openFirstItem: false,
        },
        blocks: rowBlocks,
        block_order: rowOrder,
      },
    },
    block_order: ['heading', 'accordion'],
  };
}

function patchSchema(schema) {
  schema.layout = schema.layout ?? {};
  schema.layout.faq_section = layoutFaq;

  const indexTpl = schema.templates?.find((t) => t.id === 'index');
  if (!indexTpl) throw new Error('index template missing');
  const existing = indexTpl.sections?.findIndex((s) => s.id === 'faq_section');
  if (existing >= 0) {
    indexTpl.sections[existing] = templateFaq;
  } else {
    const dividerIdx = indexTpl.sections?.findIndex((s) => s.id === 'divider') ?? -1;
    if (dividerIdx >= 0) indexTpl.sections.splice(dividerIdx, 0, templateFaq);
    else indexTpl.sections.push(templateFaq);
  }
}

function patchDefaultConfig(cfg) {
  const index = cfg.templates?.index;
  if (!index?.sections) throw new Error('templates.index missing');
  index.sections.faq_section = buildDefaultFaqSection();
}

function patchManifest(manifest) {
  manifest.sectionBlocks = manifest.sectionBlocks ?? {};
  manifest.sectionBlocks.faq = ['heading', 'accordion', 'accordion-row'];
  manifest.blockTypes = manifest.blockTypes ?? {};
  manifest.blockTypes.layout = manifest.blockTypes.layout ?? [];
  if (!manifest.blockTypes.layout.some((b) => b.id === 'accordion-row')) {
    manifest.blockTypes.layout.push({ id: 'accordion-row', label: 'Accordion row' });
  }
}

for (const target of [schemaPath, previewSchemaPath, defaultPath, previewDefaultPath, manifestPath, previewManifestPath]) {
  if (!fs.existsSync(target)) continue;
  const data = JSON.parse(fs.readFileSync(target, 'utf8'));
  if (target.endsWith('theme.schema.json')) patchSchema(data);
  else if (target.endsWith('theme.default-config.json')) patchDefaultConfig(data);
  else patchManifest(data);
  fs.writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`);
  console.log('patched', target);
}
