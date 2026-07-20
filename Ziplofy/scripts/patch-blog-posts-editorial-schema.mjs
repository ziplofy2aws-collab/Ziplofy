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
      options: [{ value: 'editorial', label: 'Editorial' }],
    },
    {
      path: `${prefix}.carouselOnMobile`,
      type: 'boolean',
      label: 'Carousel on mobile',
      group: 'Cards layout',
      widget: 'toggle',
      sidebar: true,
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
      max: 120,
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
  label: 'Blog posts: Editorial',
  description: 'Editorial grid with a featured post.',
  settingsFields: sectionSettingsFields('sections.blog_posts_editorial.settings'),
  blocks: blogPostBlocks('sections.blog_posts_editorial'),
};

const templateSection = {
  id: 'blog_posts_editorial',
  type: 'blog-posts-editorial',
  label: 'Blog posts: Editorial',
  hasBlocks: true,
  settingsFields: sectionSettingsFields('templates.index.sections.blog_posts_editorial.settings'),
  blocks: blogPostBlocks('templates.index.sections.blog_posts_editorial'),
};

function makePost(variant, title, date, author) {
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
  type: 'blog-posts-editorial',
  enabled: true,
  settings: {
    catalogVariant: 'blog-posts-editorial',
    heading: 'Blog posts',
    blogHandle: '',
    layoutType: 'editorial',
    carouselOnMobile: false,
    postCount: 3,
    sectionWidth: 'page',
    layoutGap: 64,
    colorScheme: 'scheme-1',
    paddingTop: 48,
    paddingBottom: 48,
    customCss: '',
  },
  blocks: {
    post_1: makePost('thread', 'Title', 'Jan 12', 'Author'),
    post_2: makePost('sewing', 'Title', 'Jan 10', 'Author'),
    post_3: makePost('boxes', 'Title', 'Jan 8', 'Author'),
  },
  block_order: ['post_1', 'post_2', 'post_3'],
};

function patchSchema(schema) {
  schema.layout = schema.layout ?? {};
  schema.layout.blog_posts_editorial = layoutSection;

  const indexTpl = schema.templates?.find((t) => t.id === 'index');
  if (!indexTpl) throw new Error('index template missing');
  const existing = indexTpl.sections?.findIndex((s) => s.id === 'blog_posts_editorial');
  if (existing >= 0) {
    indexTpl.sections[existing] = templateSection;
  } else {
    const anchor = indexTpl.sections?.findIndex((s) => s.id === 'blog_posts_carousel');
    if (anchor >= 0) indexTpl.sections.splice(anchor + 1, 0, templateSection);
    else indexTpl.sections.push(templateSection);
  }
}

function patchDefault(cfg) {
  cfg.templates.index.sections.blog_posts_editorial = defaultSection;
  if (!cfg.sections) cfg.sections = {};
  cfg.sections.blog_posts_editorial = {
    id: 'blog_posts_editorial',
    ...defaultSection,
  };
}

function patchManifest(manifest) {
  manifest.sectionBlocks = manifest.sectionBlocks ?? {};
  manifest.sectionBlocks['blog-posts-editorial'] = ['blog-post-card'];
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
