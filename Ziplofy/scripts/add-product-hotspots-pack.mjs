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
    field(prefix, 'heading', { type: 'text', label: 'Heading', group: 'General', sidebar: false }),
    field(prefix, 'imageUrl', {
      type: 'text',
      label: 'Image',
      group: 'General',
      widget: 'image',
      sidebar: true,
    }),
    field(prefix, 'mediaOverlay', {
      type: 'boolean',
      label: 'Media overlay',
      group: 'General',
      widget: 'toggle',
      sidebar: true,
    }),
    field(prefix, 'sectionWidth', {
      type: 'select',
      label: 'Width',
      group: 'Section layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
    }),
    field(prefix, 'sectionHeight', {
      type: 'select',
      label: 'Height',
      group: 'Section layout',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'auto', label: 'Auto' },
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
    }),
    field(prefix, 'hotspotColor', {
      type: 'color',
      label: 'Hotspot color',
      group: 'Colors',
      widget: 'color',
      sidebar: true,
    }),
    field(prefix, 'innerColor', {
      type: 'color',
      label: 'Inner color',
      group: 'Colors',
      widget: 'color',
      sidebar: true,
    }),
    field(prefix, 'colorScheme', {
      type: 'select',
      label: 'Color scheme',
      group: 'Colors',
      widget: 'color-scheme',
      sidebar: true,
      options: [
        { value: 'scheme-1', label: 'Scheme 1' },
        { value: 'scheme-2', label: 'Scheme 2' },
        { value: 'scheme-3', label: 'Scheme 3' },
        { value: 'scheme-4', label: 'Scheme 4' },
      ],
    }),
    field(prefix, 'popoverGap', {
      type: 'number',
      label: 'Vertical gap',
      group: 'Popover',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
      sidebar: true,
    }),
    field(prefix, 'titleTypography', {
      type: 'select',
      label: 'Product title typography',
      group: 'Popover',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'default', label: 'Default' },
        { value: 'heading', label: 'Heading' },
        { value: 'body', label: 'Body' },
      ],
    }),
    field(prefix, 'priceTypography', {
      type: 'select',
      label: 'Product price typography',
      group: 'Popover',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'default', label: 'Default' },
        { value: 'heading', label: 'Heading' },
        { value: 'body', label: 'Body' },
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
    type: 'product-hotspots',
    label,
    hasBlocks: true,
    settingsFields: buildSettingsFields(settingsPrefix),
    blocks: [
      {
        id: 'product_hotspot',
        type: 'product-hotspot',
        label: 'Hotspot',
        settingsFields: [
          {
            path: `${settingsPrefix.replace('.settings', '.blocks')}.product_hotspot.settings.positionX`,
            type: 'number',
            label: 'Horizontal position',
            sidebar: false,
          },
        ],
      },
    ],
  };
}

const defaultHotspotBlocks = () => {
  const positions = [
    { x: 50, y: 10 },
    { x: 22, y: 38 },
    { x: 58, y: 55 },
    { x: 35, y: 50 },
    { x: 76, y: 48 },
  ];
  const blocks = {};
  const order = [];
  positions.forEach((p, i) => {
    const id = `hotspot_${i + 1}`;
    blocks[id] = {
      type: 'product-hotspot',
      settings: {
        positionX: p.x,
        positionY: p.y,
        productId: '',
        productTitle: 'Product title',
        price: 'Rs. 19.99',
      },
    };
    order.push(id);
  });
  return { blocks, block_order: order };
};

const defaultSettings = {
  catalogVariant: 'product-hotspots',
  heading: 'Shop the look',
  imageUrl: '',
  mediaOverlay: false,
  sectionWidth: 'page',
  sectionHeight: 'auto',
  hotspotColor: '#FFFFFF57',
  innerColor: '#FFFFFF',
  colorScheme: 'scheme-1',
  popoverGap: 8,
  titleTypography: 'default',
  priceTypography: 'default',
  paddingTop: 40,
  paddingBottom: 40,
  customCss: '',
};

function patchFiles() {
  const schemaPath = path.join(packDir, 'theme.schema.json');
  const defaultPath = path.join(packDir, 'theme.default-config.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

  const layoutSection = buildSection(
    'product_hotspots',
    'Product hotspots',
    'sections.product_hotspots.settings'
  );
  schema.layout.product_hotspots = layoutSection;

  const indexTpl = schema.templates.find((t) => t.id === 'index');
  if (indexTpl && !indexTpl.sections.some((s) => s.id === 'product_hotspots')) {
    indexTpl.sections.push(
      buildSection(
        'product_hotspots',
        'Product hotspots',
        'templates.index.sections.product_hotspots.settings'
      )
    );
  }

  fs.writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);

  const cfg = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
  const { blocks, block_order } = defaultHotspotBlocks();
  cfg.sections.product_hotspots = {
    id: 'product_hotspots',
    type: 'product-hotspots',
    enabled: true,
    settings: { ...defaultSettings },
    blocks,
    block_order,
  };

  if (!cfg.templates.index.sections.product_hotspots) {
    cfg.templates.index.sections.product_hotspots = {
      type: 'product-hotspots',
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
  console.log('added product_hotspots pack');
}

patchFiles();
