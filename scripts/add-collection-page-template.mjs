import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('codiic/src/theme-packs/horizon');

const collectionTemplateSchema = {
  id: 'collection',
  label: 'Default collection',
  sections: [
    {
      id: 'collection_heading',
      type: 'collection-heading',
      label: 'Collection heading',
      hasBlocks: true,
      settingsFields: [],
      blocks: [
        {
          id: 'title',
          label: 'Title',
          settingsFields: [
            {
              path: 'templates.collection.sections.collection_heading.blocks.title.settings.text',
              type: 'textarea',
              label: 'Text',
              sidebar: true,
            },
          ],
        },
        {
          id: 'description',
          label: 'Description',
          settingsFields: [
            {
              path: 'templates.collection.sections.collection_heading.blocks.description.settings.text',
              type: 'textarea',
              label: 'Text',
              sidebar: true,
            },
          ],
        },
      ],
    },
    {
      id: 'main_collection',
      type: 'main-collection',
      label: 'Collection',
      hasBlocks: true,
      settingsFields: [
        {
          path: 'templates.collection.sections.main_collection.settings.columns',
          type: 'number',
          label: 'Columns',
        },
        {
          path: 'templates.collection.sections.main_collection.settings.mobileColumns',
          type: 'select',
          label: 'Mobile columns',
          options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
          ],
        },
        {
          path: 'templates.collection.sections.main_collection.settings.productsPerPage',
          type: 'number',
          label: 'Products per page',
        },
      ],
      blocks: [
        {
          id: 'filtering_and_sorting',
          label: 'Filtering and sorting',
          settingsFields: [
            {
              path: 'templates.collection.sections.main_collection.blocks.filtering_and_sorting.settings.enableFiltering',
              type: 'boolean',
              label: 'Enable filtering',
            },
            {
              path: 'templates.collection.sections.main_collection.blocks.filtering_and_sorting.settings.enableSorting',
              type: 'boolean',
              label: 'Enable sorting',
            },
          ],
        },
        {
          id: 'product_card',
          label: 'Product card',
          blocks: [
            { id: 'media', label: 'Product image', settingsFields: [] },
            { id: 'product_title', label: 'Product title', settingsFields: [] },
            { id: 'price', label: 'Price', settingsFields: [] },
          ],
        },
      ],
    },
  ],
  description: 'Collection page template',
};

const collectionDefaultConfig = {
  name: 'Default collection',
  sections: {
    collection_heading: {
      type: 'collection-heading',
      enabled: true,
      settings: {},
      blocks: {
        title: {
          type: 'collection-heading-title',
          settings: {
            text: 'Collection title',
            width: 'fit',
            maxWidth: 'normal',
            typographyPreset: 'heading-1',
            textColor: 'default',
            backgroundEnabled: false,
            paddingTop: 0,
            paddingBottom: 8,
            paddingLeft: 0,
            paddingRight: 0,
          },
        },
        description: {
          type: 'collection-heading-description',
          settings: {
            text: '',
            width: 'fit',
            maxWidth: 'normal',
            typographyPreset: 'paragraph',
            textColor: 'default',
            backgroundEnabled: false,
            paddingTop: 0,
            paddingBottom: 16,
            paddingLeft: 0,
            paddingRight: 0,
          },
        },
      },
      block_order: ['title', 'description'],
    },
    main_collection: {
      type: 'main-collection',
      enabled: true,
      settings: {
        columns: 4,
        mobileColumns: '2',
        productsPerPage: 16,
        horizontalGap: 12,
        verticalGap: 24,
        sectionWidth: 'page',
        paddingTop: 24,
        paddingBottom: 48,
      },
      blocks: {
        filtering_and_sorting: {
          type: 'filtering-and-sorting',
          settings: {
            enableFiltering: true,
            enableSorting: true,
          },
        },
        product_card: {
          type: 'product-card',
          settings: {
            verticalGap: 8,
            backgroundColor: 'default',
            mediaAspectRatio: 'auto',
            mediaBorderStyle: 'none',
            mediaCornerRadius: 0,
            showMedia: true,
            showTitle: true,
            showPrice: true,
            productTitleWidth: 'fit',
            productTitleMaxWidth: 'normal',
            priceWidth: 'fit',
          },
          block_order: ['media', 'product_title', 'price'],
          nested_block_order: ['media', 'product_title', 'price'],
          blocks: {},
        },
      },
      block_order: ['filtering_and_sorting', 'product_card'],
    },
  },
  section_order: ['collection_heading', 'main_collection'],
};

const sectionEditingSupport = {
  'collection-heading': {
    label: 'Collection heading',
    placement: ['template'],
    templateSectionType: 'collection-heading',
    canonicalSectionId: 'collection_heading',
    canonicalTemplateId: 'collection',
    fields: [],
    blocks: {
      title: { label: 'Title', fields: [{ key: 'text', type: 'textarea', label: 'Text' }] },
      description: { label: 'Description', fields: [{ key: 'text', type: 'textarea', label: 'Text' }] },
    },
  },
  'main-collection': {
    label: 'Collection',
    placement: ['template'],
    templateSectionType: 'main-collection',
    canonicalSectionId: 'main_collection',
    canonicalTemplateId: 'collection',
    fields: [
      { key: 'columns', type: 'number', label: 'Columns' },
      { key: 'mobileColumns', type: 'select', label: 'Mobile columns' },
      { key: 'productsPerPage', type: 'number', label: 'Products per page' },
    ],
    blocks: {
      filtering_and_sorting: {
        label: 'Filtering and sorting',
        fields: [
          { key: 'enableFiltering', type: 'boolean', label: 'Enable filtering' },
          { key: 'enableSorting', type: 'boolean', label: 'Enable sorting' },
        ],
      },
      product_card: {
        label: 'Product card',
        fields: [],
        nested: {
          media: { label: 'Product image', fields: [] },
          product_title: { label: 'Product title', fields: [] },
          price: { label: 'Price', fields: [] },
        },
      },
    },
  },
};

function patchSchema(filePath) {
  const doc = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const templates = doc.templates ?? [];
  const idx = templates.findIndex((t) => t.id === 'cart');
  const existing = templates.findIndex((t) => t.id === 'collection');
  if (existing >= 0) {
    templates[existing] = collectionTemplateSchema;
  } else if (idx >= 0) {
    templates.splice(idx, 0, collectionTemplateSchema);
  } else {
    templates.push(collectionTemplateSchema);
  }
  doc.templates = templates;
  fs.writeFileSync(filePath, JSON.stringify(doc, null, 2) + '\n');
  console.log('patched schema', filePath);
}

function patchDefaultConfig(filePath) {
  const doc = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  doc.templates = doc.templates ?? {};
  doc.templates.collection = collectionDefaultConfig;
  fs.writeFileSync(filePath, JSON.stringify(doc, null, 2) + '\n');
  console.log('patched default-config', filePath);
}

function patchSectionEditingSupport(filePath) {
  const doc = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const sections = doc.sections ?? doc;
  Object.assign(sections, sectionEditingSupport);
  if (doc.sections) doc.sections = sections;
  fs.writeFileSync(filePath, JSON.stringify(doc, null, 2) + '\n');
  console.log('patched section-editing-support', filePath);
}

for (const rel of ['theme.schema.json', 'preview/theme.schema.json']) {
  patchSchema(path.join(root, rel));
}
for (const rel of ['theme.default-config.json', 'preview/theme.default-config.json']) {
  patchDefaultConfig(path.join(root, rel));
}
patchSectionEditingSupport(path.resolve('codiic/src/theme-editor/section-editing-support.json'));
