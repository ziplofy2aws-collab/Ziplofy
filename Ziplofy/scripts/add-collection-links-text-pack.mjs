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
    field(prefix, 'collectionsPicker', {
      type: 'text',
      label: 'Collections',
      group: 'Collections',
      widget: 'collections',
      sidebar: true,
    }),
    field(prefix, 'layoutMode', {
      type: 'select',
      label: 'Layout',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'spotlight', label: 'Spotlight' },
        { value: 'text', label: 'Text' },
      ],
    }),
    field(prefix, 'sectionWidth', {
      type: 'select',
      label: 'Width',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
    }),
    field(prefix, 'alignment', {
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
    }),
    field(prefix, 'imagePosition', {
      type: 'select',
      label: 'Image position',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
    }),
    field(prefix, 'imageUrl', {
      type: 'text',
      label: 'Image',
      group: 'Layout',
      widget: 'image',
      sidebar: false,
    }),
    field(prefix, 'colorScheme', {
      type: 'select',
      label: 'Color scheme',
      group: 'Layout',
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
    type: 'collection-links-spotlight',
    label,
    hasBlocks: true,
    settingsFields: buildSettingsFields(settingsPrefix),
    blocks: [
      {
        id: 'collection_link',
        type: 'collection-link',
        label: 'Collection link',
        settingsFields: [
          {
            path: `${settingsPrefix.replace('.settings', '.blocks')}.collection_link.settings.title`,
            type: 'text',
            label: 'Title',
            sidebar: true,
          },
          {
            path: `${settingsPrefix.replace('.settings', '.blocks')}.collection_link.settings.productCount`,
            type: 'number',
            label: 'Product count',
            sidebar: true,
            min: 0,
            max: 99,
            step: 1,
          },
          {
            path: `${settingsPrefix.replace('.settings', '.blocks')}.collection_link.settings.collectionHandle`,
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

const defaultLinkBlocks = () => {
  const blocks = {};
  const block_order = [];
  for (let i = 0; i < 4; i++) {
    const id = `link_${i + 1}`;
    blocks[id] = {
      type: 'collection-link',
      settings: {
        title: 'Collection title',
        productCount: 5,
        collectionHandle: '',
        href: '/collections/all',
      },
    };
    block_order.push(id);
  }
  return { blocks, block_order };
};

const defaultTextSettings = {
  catalogVariant: 'collection-links-text',
  collectionsPicker: '',
  layoutMode: 'text',
  sectionWidth: 'page',
  alignment: 'center',
  imagePosition: 'right',
  imageUrl: '',
  colorScheme: 'scheme-1',
  paddingTop: 40,
  paddingBottom: 40,
  customCss: '',
};

function patchFiles() {
  const schemaPath = path.join(packDir, 'theme.schema.json');
  const defaultPath = path.join(packDir, 'theme.default-config.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

  schema.layout.collection_links_text = buildSection(
    'collection_links_text',
    'Collection links: Text',
    'sections.collection_links_text.settings'
  );

  const indexTpl = schema.templates.find((t) => t.id === 'index');
  if (indexTpl && !indexTpl.sections.some((s) => s.id === 'collection_links_text')) {
    indexTpl.sections.push(
      buildSection(
        'collection_links_text',
        'Collection links: Text',
        'templates.index.sections.collection_links_text.settings'
      )
    );
  }

  fs.writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);

  const cfg = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
  const { blocks, block_order } = defaultLinkBlocks();
  cfg.sections.collection_links_text = {
    id: 'collection_links_text',
    type: 'collection-links-spotlight',
    enabled: true,
    settings: { ...defaultTextSettings },
    blocks,
    block_order,
  };

  if (!cfg.templates.index.sections.collection_links_text) {
    cfg.templates.index.sections.collection_links_text = {
      type: 'collection-links-spotlight',
      enabled: true,
      settings: { ...defaultTextSettings },
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
  console.log('added collection_links_text pack');
}

patchFiles();
