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
    field(prefix, 'collectionsPicker', {
      type: 'text',
      label: 'Collections',
      group: 'Collections',
      widget: 'collections',
      sidebar: true,
    }),
    field(prefix, 'cardsLayoutType', {
      type: 'select',
      label: 'Type',
      group: 'Cards layout',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'bento', label: 'Bento' },
        { value: 'carousel', label: 'Carousel' },
        { value: 'editorial', label: 'Editorial' },
        { value: 'grid', label: 'Grid' },
      ],
    }),
    field(prefix, 'carouselOnMobile', {
      type: 'boolean',
      label: 'Carousel on mobile',
      group: 'Cards layout',
      widget: 'toggle',
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
    type: 'collection-list-grid',
    label,
    hasBlocks: true,
    settingsFields: buildSettingsFields(settingsPrefix),
    blocks: [
      {
        id: 'collection_tile',
        type: 'collection-tile',
        label: 'Collection',
        settingsFields: [
          {
            path: `${settingsPrefix.replace('.settings', '.blocks')}.collection_tile.settings.title`,
            type: 'text',
            label: 'Title',
            sidebar: true,
          },
          {
            path: `${settingsPrefix.replace('.settings', '.blocks')}.collection_tile.settings.collectionHandle`,
            type: 'text',
            label: 'Collection',
            widget: 'collection',
            sidebar: true,
          },
        ],
      },
    ],
  };
}

const TILE_VARIANTS = ['folded-shirts', 'hanger-shirts', 'hanging-sweaters'];

function defaultTileBlocks() {
  const blocks = {};
  const block_order = [];
  TILE_VARIANTS.forEach((illustrationVariant, i) => {
    const id = `tile_${i + 1}`;
    blocks[id] = {
      type: 'collection-tile',
      settings: {
        title: 'Collection title',
        collectionHandle: '',
        href: '/collections/all',
        illustrationVariant,
        imageUrl: '',
      },
    };
    block_order.push(id);
  });
  return { blocks, block_order };
}

const defaultSettings = {
  catalogVariant: 'collection-list-grid',
  heading: 'Shop by collection',
  collectionsPicker: '',
  cardsLayoutType: 'grid',
  carouselOnMobile: false,
  columns: 3,
  mobileColumns: '2',
  horizontalGap: 8,
  verticalGap: 8,
  sectionWidth: 'page',
  layoutGap: 12,
  colorScheme: 'scheme-1',
  paddingTop: 48,
  paddingBottom: 48,
  customCss: '',
};

function patchFiles() {
  const schemaPath = path.join(packDir, 'theme.schema.json');
  const defaultPath = path.join(packDir, 'theme.default-config.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

  schema.layout.collection_list_grid = buildSection(
    'collection_list_grid',
    'Collection list: Grid',
    'sections.collection_list_grid.settings'
  );

  const indexTpl = schema.templates.find((t) => t.id === 'index');
  if (indexTpl && !indexTpl.sections.some((s) => s.id === 'collection_list_grid')) {
    indexTpl.sections.push(
      buildSection(
        'collection_list_grid',
        'Collection list: Grid',
        'templates.index.sections.collection_list_grid.settings'
      )
    );
  }

  fs.writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);

  const cfg = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
  const { blocks, block_order } = defaultTileBlocks();
  cfg.sections.collection_list_grid = {
    id: 'collection_list_grid',
    type: 'collection-list-grid',
    enabled: true,
    settings: { ...defaultSettings },
    blocks,
    block_order,
  };

  if (!cfg.templates.index.sections.collection_list_grid) {
    cfg.templates.index.sections.collection_list_grid = {
      type: 'collection-list-grid',
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
  console.log('added collection_list_grid pack');
}

patchFiles();
