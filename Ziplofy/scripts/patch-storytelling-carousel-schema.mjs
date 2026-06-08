import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packDir = path.join(__dirname, '../src/theme-packs/horizon');
const schemaPath = path.join(packDir, 'theme.schema.json');
const defaultPath = path.join(packDir, 'theme.default-config.json');
const manifestPath = path.join(packDir, 'theme.manifest.json');

const COLOR_SCHEME_OPTIONS = [
  { value: 'scheme-1', label: 'Scheme 1' },
  { value: 'scheme-2', label: 'Scheme 2' },
  { value: 'scheme-3', label: 'Scheme 3' },
  { value: 'scheme-4', label: 'Scheme 4' },
];

function slideBlocks(prefix) {
  return [
    {
      id: 'carousel_slide',
      label: 'Slide',
      settingsFields: [
        {
          path: `${prefix}.blocks.carousel_slide.settings.title`,
          type: 'text',
          label: 'Title',
          group: 'Content',
          sidebar: false,
        },
        {
          path: `${prefix}.blocks.carousel_slide.settings.description`,
          type: 'textarea',
          label: 'Description',
          group: 'Content',
          sidebar: false,
        },
        {
          path: `${prefix}.blocks.carousel_slide.settings.imageUrl`,
          type: 'text',
          label: 'Image URL',
          group: 'Content',
          sidebar: false,
        },
      ],
    },
  ];
}

function sectionSettingsFields(prefix) {
  return [
    {
      path: `${prefix}.heading`,
      type: 'text',
      label: 'Heading',
      group: 'General',
      sidebar: false,
    },
    {
      path: `${prefix}.columns`,
      type: 'number',
      label: 'Columns',
      group: 'Layout',
      widget: 'slider',
      min: 1,
      max: 4,
      step: 1,
      sidebar: true,
    },
    {
      path: `${prefix}.mobileColumns`,
      type: 'select',
      label: 'Mobile columns',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
      ],
    },
    {
      path: `${prefix}.sectionWidth`,
      type: 'select',
      label: 'Width',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
    },
    {
      path: `${prefix}.horizontalGap`,
      type: 'number',
      label: 'Horizontal gap',
      group: 'Layout',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: `${prefix}.colorScheme`,
      type: 'select',
      label: 'Color scheme',
      group: 'Layout',
      widget: 'color-scheme',
      sidebar: true,
      options: COLOR_SCHEME_OPTIONS,
    },
    {
      path: `${prefix}.navIcon`,
      type: 'select',
      label: 'Icon',
      group: 'Navigation',
      sidebar: true,
      options: [
        { value: 'arrows', label: 'Arrows' },
        { value: 'chevron', label: 'Chevron' },
        { value: 'none', label: 'None' },
      ],
    },
    {
      path: `${prefix}.navIconBackground`,
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

const layoutSection = {
  label: 'Carousel',
  description: 'Horizontal carousel of storytelling slides.',
  settingsFields: sectionSettingsFields('sections.storytelling_carousel.settings'),
  blocks: slideBlocks('sections.storytelling_carousel'),
};

const templateSection = {
  id: 'storytelling_carousel',
  type: 'storytelling-carousel',
  label: 'Carousel',
  hasBlocks: true,
  settingsFields: sectionSettingsFields('templates.index.sections.storytelling_carousel.settings'),
  blocks: slideBlocks('templates.index.sections.storytelling_carousel'),
};

const DEFAULT_DESC = 'Made with care and unconditionally loved by our customers.';

function makeSlide(title) {
  return {
    type: 'carousel-slide',
    settings: {
      title,
      description: DEFAULT_DESC,
      imageUrl: '',
    },
  };
}

const defaultSection = {
  type: 'storytelling-carousel',
  enabled: true,
  settings: {
    catalogVariant: 'storytelling-carousel',
    heading: 'Discover elevated design',
    columns: 3,
    mobileColumns: '1',
    sectionWidth: 'page',
    horizontalGap: 12,
    colorScheme: 'scheme-1',
    navIcon: 'arrows',
    navIconBackground: 'none',
    paddingTop: 48,
    paddingBottom: 48,
    customCss: '',
  },
  blocks: {
    slide_1: makeSlide('Artistry in action'),
    slide_2: makeSlide('Uncompromising quality'),
    slide_3: makeSlide('Made to last'),
  },
  block_order: ['slide_1', 'slide_2', 'slide_3'],
};

function patchSchema(schema) {
  schema.layout = schema.layout ?? {};
  schema.layout.storytelling_carousel = layoutSection;

  const indexTpl = schema.templates?.find((t) => t.id === 'index');
  if (!indexTpl) throw new Error('index template missing');
  const existing = indexTpl.sections?.findIndex((s) => s.id === 'storytelling_carousel');
  if (existing >= 0) {
    indexTpl.sections[existing] = templateSection;
  } else {
    const anchor = indexTpl.sections?.findIndex((s) => s.id === 'blog_posts_grid');
    if (anchor >= 0) indexTpl.sections.splice(anchor + 1, 0, templateSection);
    else indexTpl.sections.push(templateSection);
  }
}

function patchDefault(cfg) {
  cfg.templates.index.sections.storytelling_carousel = defaultSection;
  if (!cfg.sections) cfg.sections = {};
  cfg.sections.storytelling_carousel = {
    id: 'storytelling_carousel',
    ...defaultSection,
  };
}

function patchManifest(manifest) {
  manifest.sectionBlocks = manifest.sectionBlocks ?? {};
  manifest.sectionBlocks['storytelling-carousel'] = ['carousel-slide'];
}

for (const target of [schemaPath, defaultPath, manifestPath]) {
  const data = JSON.parse(fs.readFileSync(target, 'utf8'));
  if (target.endsWith('theme.schema.json')) patchSchema(data);
  else if (target.endsWith('theme.default-config.json')) patchDefault(data);
  else patchManifest(data);
  fs.writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`);
  console.log('patched', target);
}

const z3b = path.join(__dirname, '../../Ziplofy3b/src/theme-packs/horizon');
for (const name of ['theme.schema.json', 'theme.default-config.json', 'theme.manifest.json']) {
  const dest = path.join(z3b, name);
  if (fs.existsSync(path.dirname(dest))) {
    fs.copyFileSync(path.join(packDir, name), dest);
    console.log('copied to', dest);
  }
}
