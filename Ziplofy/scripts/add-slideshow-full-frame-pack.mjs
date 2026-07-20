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
    field(prefix, 'sectionLayout', {
      type: 'select',
      label: 'Layout',
      group: 'General',
      widget: 'select-inline',
      sidebar: true,
      options: [{ value: 'full-frame', label: 'Full frame' }],
    }),
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
    field(prefix, 'mediaHeight', {
      type: 'select',
      label: 'Media height',
      group: 'General',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
    }),
    field(prefix, 'contentPosition', {
      type: 'select',
      label: 'Content position',
      group: 'General',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'on-media', label: 'On media' },
        { value: 'below-media', label: 'Below media' },
      ],
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
    field(prefix, 'navigationIcon', {
      type: 'select',
      label: 'Icons',
      group: 'Navigation',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'large-arrows', label: 'Large arrows' },
        { value: 'arrows', label: 'Arrows' },
        { value: 'chevron', label: 'Chevron' },
        { value: 'none', label: 'None' },
      ],
    }),
    field(prefix, 'navigationIconBackground', {
      type: 'select',
      label: 'Icon background',
      group: 'Navigation',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'circle', label: 'Circle' },
        { value: 'square', label: 'Square' },
      ],
    }),
    field(prefix, 'pagination', {
      type: 'select',
      label: 'Pagination',
      group: 'Navigation',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'dots', label: 'Dots' },
        { value: 'counter', label: 'Counter' },
        { value: 'none', label: 'None' },
      ],
    }),
    field(prefix, 'autoRotate', {
      type: 'boolean',
      label: 'Auto-rotate slides',
      group: 'Navigation',
      widget: 'toggle',
      sidebar: true,
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
    type: 'slideshow-full-frame',
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
      peekVariant: 'landscape',
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
  catalogVariant: 'slideshow-full-frame',
  sectionLayout: 'full-frame',
  sectionWidth: 'full',
  mediaHeight: 'medium',
  contentPosition: 'on-media',
  colorScheme: 'scheme-1',
  navigationIcon: 'large-arrows',
  navigationIconBackground: 'none',
  pagination: 'dots',
  autoRotate: false,
  paddingTop: 0,
  paddingBottom: 0,
  customCss: '',
};

function patchFiles() {
  const schemaPath = path.join(packDir, 'theme.schema.json');
  const defaultPath = path.join(packDir, 'theme.default-config.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

  schema.layout.slideshow_full_frame = buildSection(
    'slideshow_full_frame',
    'Slideshow: Full frame',
    'sections.slideshow_full_frame.settings'
  );

  const indexTpl = schema.templates.find((t) => t.id === 'index');
  if (indexTpl && !indexTpl.sections.some((s) => s.id === 'slideshow_full_frame')) {
    indexTpl.sections.push(
      buildSection(
        'slideshow_full_frame',
        'Slideshow: Full frame',
        'templates.index.sections.slideshow_full_frame.settings'
      )
    );
  }

  fs.writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);

  const cfg = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
  const { blocks, block_order } = defaultSlides();
  cfg.sections.slideshow_full_frame = {
    id: 'slideshow_full_frame',
    type: 'slideshow-full-frame',
    enabled: true,
    settings: { ...defaultSettings },
    blocks,
    block_order,
  };

  if (!cfg.templates.index.sections.slideshow_full_frame) {
    cfg.templates.index.sections.slideshow_full_frame = {
      type: 'slideshow-full-frame',
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
  console.log('added slideshow_full_frame pack');
}

patchFiles();
