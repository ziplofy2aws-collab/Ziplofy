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
    field(prefix, 'productId', {
      type: 'text',
      label: 'Product',
      group: 'Product',
      widget: 'product',
      sidebar: true,
    }),
    field(prefix, 'recommendationType', {
      type: 'select',
      label: 'Type',
      group: 'Product',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'related', label: 'Related' },
        { value: 'complementary', label: 'Complementary' },
        { value: 'closest', label: 'Closest product' },
      ],
    }),
    field(prefix, 'cardStyle', {
      type: 'select',
      label: 'Style',
      group: 'Cards layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'grid', label: 'Grid' },
        { value: 'carousel', label: 'Carousel' },
      ],
    }),
    field(prefix, 'carouselOnMobile', {
      type: 'boolean',
      label: 'Carousel on mobile',
      group: 'Cards layout',
      widget: 'toggle',
      sidebar: true,
    }),
    field(prefix, 'productCount', {
      type: 'number',
      label: 'Product count',
      group: 'Cards layout',
      widget: 'slider',
      min: 1,
      max: 12,
      step: 1,
      sidebar: true,
    }),
    field(prefix, 'columns', {
      type: 'number',
      label: 'Columns',
      group: 'Cards layout',
      widget: 'slider',
      min: 1,
      max: 6,
      step: 1,
      sidebar: true,
    }),
    field(prefix, 'mobileColumns', {
      type: 'select',
      label: 'Mobile columns',
      group: 'Cards layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
      ],
    }),
    field(prefix, 'horizontalGap', {
      type: 'number',
      label: 'Horizontal gap',
      group: 'Cards layout',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
      sidebar: true,
    }),
    field(prefix, 'verticalGap', {
      type: 'number',
      label: 'Vertical gap',
      group: 'Cards layout',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
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
    field(prefix, 'layoutGap', {
      type: 'number',
      label: 'Gap',
      group: 'Section layout',
      widget: 'slider',
      min: 0,
      max: 64,
      step: 1,
      unit: 'px',
      sidebar: true,
    }),
    field(prefix, 'colorScheme', {
      type: 'select',
      label: 'Color scheme',
      group: 'Section layout',
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
    type: 'recommended-products',
    label,
    hasBlocks: true,
    settingsFields: buildSettingsFields(settingsPrefix),
    blocks: [
      {
        id: 'recommended_product_card',
        type: 'recommended-product-card',
        label: 'Product card',
        settingsFields: [],
      },
    ],
  };
}

const defaultCardBlocks = () => {
  const specs = [
    { shirtColor: '#d45454', withSun: false },
    { shirtColor: '#5a9a6a', withSun: false },
    { shirtColor: '#4b5563', withSun: true },
    { shirtColor: '#d45454', withSun: false },
  ];
  const blocks = {};
  const block_order = [];
  specs.forEach((spec, i) => {
    const id = `product_${i + 1}`;
    blocks[id] = {
      type: 'recommended-product-card',
      settings: {
        shirtColor: spec.shirtColor,
        withSun: spec.withSun,
        productTitle: 'Product title',
        price: 'Rs. 19.99',
        productId: '',
      },
    };
    block_order.push(id);
  });
  return { blocks, block_order };
};

const defaultSettings = {
  catalogVariant: 'recommended-products',
  heading: 'Related products',
  productId: '',
  recommendationType: 'related',
  cardStyle: 'grid',
  carouselOnMobile: false,
  productCount: 4,
  columns: 4,
  mobileColumns: '2',
  horizontalGap: 12,
  verticalGap: 24,
  sectionWidth: 'page',
  layoutGap: 28,
  colorScheme: 'scheme-1',
  paddingTop: 48,
  paddingBottom: 48,
  customCss: '',
};

function patchFiles() {
  const schemaPath = path.join(packDir, 'theme.schema.json');
  const defaultPath = path.join(packDir, 'theme.default-config.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

  schema.layout.recommended_products = buildSection(
    'recommended_products',
    'Recommended products',
    'sections.recommended_products.settings'
  );

  const indexTpl = schema.templates.find((t) => t.id === 'index');
  if (indexTpl && !indexTpl.sections.some((s) => s.id === 'recommended_products')) {
    indexTpl.sections.push(
      buildSection(
        'recommended_products',
        'Recommended products',
        'templates.index.sections.recommended_products.settings'
      )
    );
  }

  fs.writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);

  const cfg = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
  const { blocks, block_order } = defaultCardBlocks();
  cfg.sections.recommended_products = {
    id: 'recommended_products',
    type: 'recommended-products',
    enabled: true,
    settings: { ...defaultSettings },
    blocks,
    block_order,
  };

  if (!cfg.templates.index.sections.recommended_products) {
    cfg.templates.index.sections.recommended_products = {
      type: 'recommended-products',
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
  console.log('added recommended_products pack');
}

patchFiles();
