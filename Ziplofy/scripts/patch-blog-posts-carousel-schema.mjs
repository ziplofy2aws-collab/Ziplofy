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

function blogPostBlocks(prefix) {
  return [
    {
      id: 'blog_post_card',
      label: 'Blog post',
      settingsFields: [
        {
          path: `${prefix}.blocks.blog_post_card.settings.illustrationVariant`,
          type: 'select',
          label: 'Illustration',
          group: 'Content',
          sidebar: false,
          options: [
            { value: 'sewing', label: 'Sewing machine' },
            { value: 'thread', label: 'Thread' },
            { value: 'boxes', label: 'Boxes' },
          ],
        },
        {
          path: `${prefix}.blocks.blog_post_card.settings.title`,
          type: 'text',
          label: 'Title',
          group: 'Content',
          sidebar: false,
        },
        {
          path: `${prefix}.blocks.blog_post_card.settings.date`,
          type: 'text',
          label: 'Date',
          group: 'Content',
          sidebar: false,
        },
        {
          path: `${prefix}.blocks.blog_post_card.settings.author`,
          type: 'text',
          label: 'Author',
          group: 'Content',
          sidebar: false,
        },
        {
          path: `${prefix}.blocks.blog_post_card.settings.excerpt`,
          type: 'textarea',
          label: 'Excerpt',
          group: 'Content',
          sidebar: false,
        },
        {
          path: `${prefix}.blocks.blog_post_card.settings.imageUrl`,
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
      path: `${prefix}.blogHandle`,
      type: 'select',
      label: 'Blog',
      group: 'General',
      sidebar: true,
      options: [
        { value: '', label: 'Select' },
        { value: 'news', label: 'News' },
        { value: 'journal', label: 'Journal' },
      ],
    },
    {
      path: `${prefix}.layoutType`,
      type: 'select',
      label: 'Type',
      group: 'Cards layout',
      sidebar: true,
      options: [{ value: 'carousel', label: 'Carousel' }],
    },
    {
      path: `${prefix}.postCount`,
      type: 'number',
      label: 'Post count',
      group: 'Cards layout',
      widget: 'slider',
      min: 1,
      max: 12,
      step: 1,
      sidebar: true,
    },
    {
      path: `${prefix}.columns`,
      type: 'number',
      label: 'Columns',
      group: 'Cards layout',
      widget: 'slider',
      min: 1,
      max: 4,
      step: 1,
      sidebar: true,
    },
    {
      path: `${prefix}.mobileCardSize`,
      type: 'select',
      label: 'Mobile card size',
      group: 'Cards layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
      ],
    },
    {
      path: `${prefix}.horizontalGap`,
      type: 'number',
      label: 'Horizontal gap',
      group: 'Cards layout',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: `${prefix}.navIcon`,
      type: 'select',
      label: 'Icon',
      group: 'Carousel navigation',
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
      group: 'Carousel navigation',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'circle', label: 'Circle' },
        { value: 'square', label: 'Square' },
      ],
    },
    {
      path: `${prefix}.sectionWidth`,
      type: 'select',
      label: 'Width',
      group: 'Section layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
    },
    {
      path: `${prefix}.layoutGap`,
      type: 'number',
      label: 'Gap',
      group: 'Section layout',
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
      group: 'Section layout',
      widget: 'color-scheme',
      sidebar: true,
      options: COLOR_SCHEME_OPTIONS,
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
  label: 'Blog posts: Carousel',
  description: 'Horizontal carousel of blog post cards.',
  settingsFields: sectionSettingsFields('sections.blog_posts_carousel.settings'),
  blocks: blogPostBlocks('sections.blog_posts_carousel'),
};

const templateSection = {
  id: 'blog_posts_carousel',
  type: 'blog-posts-carousel',
  label: 'Blog posts: Carousel',
  hasBlocks: true,
  settingsFields: sectionSettingsFields('templates.index.sections.blog_posts_carousel.settings'),
  blocks: blogPostBlocks('templates.index.sections.blog_posts_carousel'),
};

function makePost(id, variant, title, date, author) {
  return {
    type: 'blog-post-card',
    settings: {
      illustrationVariant: variant,
      title,
      date,
      author,
      excerpt: "An excerpt of your blog post's content",
      imageUrl: '',
    },
  };
}

const defaultSection = {
  type: 'blog-posts-carousel',
  enabled: true,
  settings: {
    catalogVariant: 'blog-posts-carousel',
    heading: 'Blog posts',
    blogHandle: '',
    layoutType: 'carousel',
    postCount: 5,
    columns: 3,
    mobileCardSize: '1',
    horizontalGap: 8,
    navIcon: 'arrows',
    navIconBackground: 'circle',
    sectionWidth: 'page',
    layoutGap: 12,
    colorScheme: 'scheme-1',
    paddingTop: 48,
    paddingBottom: 48,
    customCss: '',
  },
  blocks: {
    post_1: makePost('post_1', 'sewing', 'Title', 'Jan 12', 'Author'),
    post_2: makePost('post_2', 'thread', 'Title', 'Jan 10', 'Author'),
    post_3: makePost('post_3', 'boxes', 'Title', 'Jan 8', 'Author'),
    post_4: makePost('post_4', 'thread', 'Title', 'Jan 5', 'Author'),
    post_5: makePost('post_5', 'sewing', 'Title', 'Jan 2', 'Author'),
  },
  block_order: ['post_1', 'post_2', 'post_3', 'post_4', 'post_5'],
};

function patchSchema(schema) {
  schema.layout = schema.layout ?? {};
  schema.layout.blog_posts_carousel = layoutSection;

  const indexTpl = schema.templates?.find((t) => t.id === 'index');
  if (!indexTpl) throw new Error('index template missing');
  const existing = indexTpl.sections?.findIndex((s) => s.id === 'blog_posts_carousel');
  if (existing >= 0) {
    indexTpl.sections[existing] = templateSection;
  } else {
    const anchor = indexTpl.sections?.findIndex((s) => s.id === 'text_marquee_section');
    if (anchor >= 0) indexTpl.sections.splice(anchor + 1, 0, templateSection);
    else indexTpl.sections.push(templateSection);
  }
}

function patchDefault(cfg) {
  cfg.templates.index.sections.blog_posts_carousel = defaultSection;
  if (!cfg.sections) cfg.sections = {};
  cfg.sections.blog_posts_carousel = {
    id: 'blog_posts_carousel',
    ...defaultSection,
  };
}

function patchManifest(manifest) {
  manifest.sectionBlocks = manifest.sectionBlocks ?? {};
  manifest.sectionBlocks['blog-posts-carousel'] = ['blog-post-card'];
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
