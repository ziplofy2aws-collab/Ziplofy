import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packDir = path.join(__dirname, '../src/theme-packs/horizon');

function field(prefix, suffix, spec) {
  return {
    path: `${prefix}.${suffix}`,
    type: spec.type,
    label: spec.label,
    group: spec.group,
    widget: spec.widget,
    sidebar: spec.sidebar !== false,
    min: spec.min,
    max: spec.max,
    step: spec.step,
    unit: spec.unit,
    options: spec.options,
  };
}

function buildSettingsFields(prefix) {
  return [
    field(prefix, 'sectionWidth', {
      type: 'select',
      label: 'Width',
      group: 'General',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
    }),
    field(prefix, 'height', {
      type: 'select',
      label: 'Height',
      group: 'General',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
    }),
    field(prefix, 'cornerRadius', {
      type: 'number',
      label: 'Corner radius',
      group: 'General',
      widget: 'slider',
      min: 0,
      max: 40,
      step: 1,
      unit: 'px',
      sidebar: true,
    }),
    field(prefix, 'borderThickness', {
      type: 'number',
      label: 'Border thickness',
      group: 'General',
      widget: 'slider',
      min: 0,
      max: 8,
      step: 1,
      unit: 'px',
      sidebar: true,
    }),
    field(prefix, 'dropShadow', {
      type: 'boolean',
      label: 'Drop shadow',
      group: 'General',
      widget: 'toggle',
      sidebar: true,
    }),
    field(prefix, 'colorScheme', {
      type: 'select',
      label: 'Color scheme',
      group: 'General',
      widget: 'color-scheme',
      sidebar: true,
      options: [
        { value: 'scheme-1', label: 'Scheme 1' },
        { value: 'scheme-2', label: 'Scheme 2' },
        { value: 'scheme-3', label: 'Scheme 3' },
        { value: 'scheme-4', label: 'Scheme 4' },
      ],
    }),
    field(prefix, 'paddingTop', {
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: true,
    }),
    field(prefix, 'paddingBottom', {
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: true,
    }),
    field(prefix, 'customCss', {
      type: 'textarea',
      label: 'Custom CSS',
      group: 'Custom CSS',
      widget: 'accordion',
      sidebar: true,
    }),
  ];
}

function buildSection(id, label, settingsPrefix) {
  return {
    id,
    type: 'layered-slideshow',
    label,
    hasBlocks: true,
    settingsFields: buildSettingsFields(settingsPrefix),
    blocks: [
      {
        id: 'slideshow_slide',
        type: 'slideshow-slide',
        label: 'Slide',
        settingsFields: [
          {
            path: `${settingsPrefix.replace('.settings', '.blocks')}.slideshow_slide.settings.title`,
            type: 'text',
            label: 'Heading',
            sidebar: true,
          },
          {
            path: `${settingsPrefix.replace('.settings', '.blocks')}.slideshow_slide.settings.body`,
            type: 'textarea',
            label: 'Text',
            sidebar: true,
          },
          {
            path: `${settingsPrefix.replace('.settings', '.blocks')}.slideshow_slide.settings.buttonLabel`,
            type: 'text',
            label: 'Button label',
            sidebar: true,
          },
          {
            path: `${settingsPrefix.replace('.settings', '.blocks')}.slideshow_slide.settings.buttonHref`,
            type: 'text',
            label: 'Button link',
            sidebar: true,
          },
          {
            path: `${settingsPrefix.replace('.settings', '.blocks')}.slideshow_slide.settings.imageUrl`,
            type: 'text',
            label: 'Image',
            widget: 'image',
            sidebar: true,
          },
          {
            path: `${settingsPrefix.replace('.settings', '.blocks')}.slideshow_slide.settings.peekVariant`,
            type: 'select',
            label: 'Peek style',
            sidebar: false,
            options: [
              { value: 'landscape', label: 'Landscape' },
              { value: 'figure', label: 'Figure' },
            ],
          },
        ],
      },
    ],
  };
}

function defaultSlides() {
  const blocks = {};
  const block_order = [];
  const specs = [
    {
      title: 'New arrivals',
      body: 'Introducing our latest products, made especially for the season. Shop your favorites before they\'re gone!',
      peekVariant: 'figure',
    },
    {
      title: 'Bestsellers',
      body: 'Our most-loved pieces, back in stock for a limited time.',
      peekVariant: 'landscape',
    },
  ];
  specs.forEach((spec, i) => {
    const id = `slide_${i + 1}`;
    blocks[id] = {
      type: 'slideshow-slide',
      settings: {
        title: spec.title,
        body: spec.body,
        buttonLabel: 'Shop now',
        buttonHref: '/collections/all',
        imageUrl: '',
        peekVariant: spec.peekVariant,
      },
    };
    block_order.push(id);
  });
  return { blocks, block_order };
}

const defaultSettings = {
  catalogVariant: 'layered-slideshow',
  sectionWidth: 'page',
  height: 'medium',
  cornerRadius: 0,
  borderThickness: 1,
  dropShadow: false,
  colorScheme: 'scheme-1',
  paddingTop: 40,
  paddingBottom: 40,
  customCss: '',
};

function patchFiles() {
  const schemaPath = path.join(packDir, 'theme.schema.json');
  const defaultPath = path.join(packDir, 'theme.default-config.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

  schema.layout.layered_slideshow = buildSection(
    'layered_slideshow',
    'Layered slideshow',
    'sections.layered_slideshow.settings'
  );

  const indexTpl = schema.templates.find((t) => t.id === 'index');
  if (indexTpl && !indexTpl.sections.some((s) => s.id === 'layered_slideshow')) {
    indexTpl.sections.push(
      buildSection(
        'layered_slideshow',
        'Layered slideshow',
        'templates.index.sections.layered_slideshow.settings'
      )
    );
  }

  fs.writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);

  const cfg = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
  const { blocks, block_order } = defaultSlides();
  cfg.sections.layered_slideshow = {
    id: 'layered_slideshow',
    type: 'layered-slideshow',
    enabled: true,
    settings: { ...defaultSettings },
    blocks,
    block_order,
  };

  if (!cfg.templates.index.sections.layered_slideshow) {
    cfg.templates.index.sections.layered_slideshow = {
      type: 'layered-slideshow',
      enabled: true,
      settings: { ...defaultSettings },
      blocks: JSON.parse(JSON.stringify(blocks)),
      block_order: [...block_order],
    };
  }

  fs.writeFileSync(defaultPath, `${JSON.stringify(cfg, null, 2)}\n`);

  const z3b = path.join(__dirname, '../../Ziplofy3b/src/theme-packs/horizon');
  if (fs.existsSync(z3b)) {
    fs.copyFileSync(schemaPath, path.join(z3b, 'theme.schema.json'));
    fs.copyFileSync(defaultPath, path.join(z3b, 'theme.default-config.json'));
  }
  console.log('added layered_slideshow pack');
}

patchFiles();
