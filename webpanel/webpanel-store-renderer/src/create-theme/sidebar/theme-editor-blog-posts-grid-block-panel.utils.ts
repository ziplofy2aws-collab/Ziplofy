import type { EditorFieldDef } from './create-theme-sidebar.types';

export type BlogPostsGridBlockKind = 'title' | 'image' | 'card-title' | 'details' | 'excerpt';

const BLOG_POSTS_CARD_SECTION_ID = /^blog_posts_(?:grid|editorial|carousel)(?:_\d+)?$/;

export function isBlogPostsCardSectionInstanceId(secId: string): boolean {
  return BLOG_POSTS_CARD_SECTION_ID.test(secId);
}

export function isBlogPostsGridSectionInstanceId(secId: string): boolean {
  return secId === 'blog_posts_grid' || secId.startsWith('blog_posts_grid_');
}

export function isBlogPostsEditorialSectionInstanceId(secId: string): boolean {
  return secId === 'blog_posts_editorial' || secId.startsWith('blog_posts_editorial_');
}

export function isBlogPostsCarouselSectionInstanceId(secId: string): boolean {
  return secId === 'blog_posts_carousel' || secId.startsWith('blog_posts_carousel_');
}

export function blogPostsGridSectionBaseFromNodeId(nodeId: string): string | null {
  const layout = nodeId.match(/^layout:(.+):block:(?:title|blog_card)/);
  if (layout) {
    const secId = layout[1]!;
    if (!isBlogPostsCardSectionInstanceId(secId)) return null;
    return `sections.${secId}`;
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:(?:title|blog_card)/);
  if (tpl) {
    const secId = tpl[2]!;
    if (!isBlogPostsCardSectionInstanceId(secId)) return null;
    return `templates.${tpl[1]}.sections.${tpl[2]}`;
  }
  const layoutSection = nodeId.match(/^layout:(blog_posts_(?:grid|editorial|carousel)(?:_\d+)?)$/);
  if (layoutSection) return `sections.${layoutSection[1]}`;
  const tplSection = nodeId.match(/^template:([^:]+):(blog_posts_(?:grid|editorial|carousel)(?:_\d+)?)$/);
  if (tplSection) return `templates.${tplSection[1]}.sections.${tplSection[2]}`;
  return null;
}

export function blogPostsGridTemplatePostIdFromNodeId(_nodeId: string): string {
  return 'post_1';
}

export function blogPostsGridBlockKindFromNodeId(nodeId: string): BlogPostsGridBlockKind | null {
  if (/:block:title$/.test(nodeId)) return 'title';
  if (/:block:blog_card:nested:image$/.test(nodeId)) return 'image';
  if (/:block:blog_card:nested:title$/.test(nodeId)) return 'card-title';
  if (/:block:blog_card:nested:details$/.test(nodeId)) return 'details';
  if (/:block:blog_card:nested:excerpt$/.test(nodeId)) return 'excerpt';
  return null;
}

export function isBlogPostsGridTitleBlockNodeId(nodeId: string): boolean {
  return /:block:title$/.test(nodeId) && blogPostsGridSectionBaseFromNodeId(nodeId) !== null;
}

export function isBlogPostsGridCardGroupNodeId(nodeId: string): boolean {
  return /:block:blog_card$/.test(nodeId) && blogPostsGridSectionBaseFromNodeId(nodeId) !== null;
}

export function isBlogPostsGridCardImageBlockNodeId(nodeId: string): boolean {
  return /:block:blog_card:nested:image$/.test(nodeId);
}

export function isBlogPostsGridCardTitleBlockNodeId(nodeId: string): boolean {
  return /:block:blog_card:nested:title$/.test(nodeId);
}

export function isBlogPostsGridCardDetailsBlockNodeId(nodeId: string): boolean {
  return /:block:blog_card:nested:details$/.test(nodeId);
}

export function isBlogPostsGridCardExcerptBlockNodeId(nodeId: string): boolean {
  return /:block:blog_card:nested:excerpt$/.test(nodeId);
}

export function blogPostsGridSectionTitleDefaultSettings(): Record<string, string | boolean> {
  return {
    heading: 'Blog posts',
    headingWidth: 'fit',
    headingMaxWidth: 'normal',
    headingTypographyPreset: 'default',
    headingBackgroundEnabled: false,
    headingPaddingTop: '0',
    headingPaddingBottom: '0',
    headingPaddingLeft: '0',
    headingPaddingRight: '0',
  };
}

export function blogPostsGridCardImageDefaultSettings(): Record<string, string | boolean> {
  return {
    imageUrl: '',
    illustrationVariant: 'sewing',
    imageAspectRatio: 'square',
    imageBorderStyle: 'none',
    imageCornerRadius: '0',
  };
}

export function blogPostsGridCardTitleDefaultSettings(): Record<string, string | boolean> {
  return {
    title: 'Title',
    titleTypographyPreset: 'default',
    titleColor: 'default',
    titlePaddingTop: '0',
    titlePaddingBottom: '0',
    titlePaddingLeft: '0',
    titlePaddingRight: '0',
  };
}

export function blogPostsGridCardDetailsDefaultSettings(): Record<string, string | boolean> {
  return {
    date: 'Jan 12',
    author: 'Author',
    detailsDateEnabled: false,
    detailsAuthorEnabled: false,
    detailsTypographyPreset: 'default',
    detailsColor: 'default',
    detailsPaddingTop: '0',
    detailsPaddingBottom: '0',
    detailsPaddingLeft: '0',
    detailsPaddingRight: '0',
  };
}

export function blogPostsGridCardExcerptDefaultSettings(): Record<string, string | boolean> {
  return {
    excerpt: "An excerpt of your blog post's content",
    excerptTypographyPreset: 'default',
    excerptColor: 'default',
    excerptPaddingTop: '8',
    excerptPaddingBottom: '0',
    excerptPaddingLeft: '0',
    excerptPaddingRight: '0',
  };
}

export function blogPostsGridBlockFieldDefs(
  settingsBase: string,
  blockKind: BlogPostsGridBlockKind
): EditorFieldDef[] {
  if (blockKind === 'title') {
    const s = (key: string) => `${settingsBase}.${key}`;
    return [
      {
        path: s('heading'),
        type: 'textarea',
        label: 'Text',
        group: 'Content',
        widget: 'richtext',
        sidebar: true,
      },
      {
        path: s('headingWidth'),
        type: 'select',
        label: 'Width',
        group: 'Layout',
        widget: 'segmented',
        options: [
          { value: 'fit', label: 'Fit' },
          { value: 'fill', label: 'Fill' },
        ],
        sidebar: true,
      },
      {
        path: s('headingMaxWidth'),
        type: 'select',
        label: 'Max width',
        group: 'Layout',
        widget: 'select-inline',
        options: [
          { value: 'narrow', label: 'Narrow' },
          { value: 'normal', label: 'Normal' },
          { value: 'wide', label: 'Wide' },
        ],
        sidebar: true,
      },
      {
        path: s('headingTypographyPreset'),
        type: 'select',
        label: 'Preset',
        group: 'Typography',
        widget: 'select-inline',
        description: 'Edit presets in theme settings',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'heading-1', label: 'Heading 1' },
          { value: 'heading-2', label: 'Heading 2' },
          { value: 'heading-3', label: 'Heading 3' },
          { value: 'heading-4', label: 'Heading 4' },
          { value: 'heading-5', label: 'Heading 5' },
          { value: 'heading-6', label: 'Heading 6' },
        ],
        sidebar: true,
      },
      {
        path: s('headingBackgroundEnabled'),
        type: 'boolean',
        label: 'Background',
        group: 'Appearance',
        sidebar: true,
      },
      {
        path: s('headingPaddingTop'),
        type: 'number',
        label: 'Top',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('headingPaddingBottom'),
        type: 'number',
        label: 'Bottom',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('headingPaddingLeft'),
        type: 'number',
        label: 'Left',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('headingPaddingRight'),
        type: 'number',
        label: 'Right',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
    ];
  }

  const s = (key: string) => `${settingsBase}.${key}`;

  if (blockKind === 'image') {
    return [
      {
        path: s('imageUrl'),
        type: 'text',
        label: 'Image',
        group: 'General',
        widget: 'image',
        sidebar: true,
      },
      {
        path: s('illustrationVariant'),
        type: 'select',
        label: 'Illustration',
        group: 'General',
        widget: 'select-inline',
        sidebar: true,
        options: [
          { value: 'sewing', label: 'Sewing' },
          { value: 'thread', label: 'Thread' },
          { value: 'boxes', label: 'Boxes' },
        ],
      },
      {
        path: s('imageAspectRatio'),
        type: 'select',
        label: 'Aspect ratio',
        group: 'Size',
        widget: 'select-inline',
        sidebar: true,
        options: [
          { value: 'square', label: 'Square' },
          { value: 'portrait', label: 'Portrait' },
          { value: 'landscape', label: 'Landscape' },
        ],
      },
      {
        path: s('imageBorderStyle'),
        type: 'select',
        label: 'Style',
        group: 'Borders',
        widget: 'segmented',
        sidebar: true,
        options: [
          { value: 'none', label: 'None' },
          { value: 'solid', label: 'Solid' },
        ],
      },
      {
        path: s('imageCornerRadius'),
        type: 'number',
        label: 'Corner radius',
        group: 'Borders',
        widget: 'slider',
        min: 0,
        max: 40,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
    ];
  }

  if (blockKind === 'card-title') {
    return [
      {
        path: s('titleTypographyPreset'),
        type: 'select',
        label: 'Preset',
        group: 'Typography',
        widget: 'select-inline',
        description: 'Edit presets in theme settings',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'heading-1', label: 'Heading 1' },
          { value: 'heading-2', label: 'Heading 2' },
          { value: 'heading-3', label: 'Heading 3' },
          { value: 'heading-4', label: 'Heading 4' },
          { value: 'heading-5', label: 'Heading 5' },
          { value: 'heading-6', label: 'Heading 6' },
        ],
        sidebar: true,
      },
      {
        path: s('title'),
        type: 'textarea',
        label: 'Text',
        group: 'Content',
        widget: 'richtext',
        sidebar: true,
      },
      {
        path: s('titleColor'),
        type: 'color',
        label: 'Text color',
        group: 'Appearance',
        widget: 'color',
        sidebar: true,
      },
      {
        path: s('titlePaddingTop'),
        type: 'number',
        label: 'Top',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('titlePaddingBottom'),
        type: 'number',
        label: 'Bottom',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('titlePaddingLeft'),
        type: 'number',
        label: 'Left',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('titlePaddingRight'),
        type: 'number',
        label: 'Right',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
    ];
  }

  if (blockKind === 'details') {
    return [
      {
        path: s('detailsDateEnabled'),
        type: 'boolean',
        label: 'Date',
        group: 'Content',
        sidebar: true,
      },
      {
        path: s('detailsAuthorEnabled'),
        type: 'boolean',
        label: 'Author',
        group: 'Content',
        sidebar: true,
      },
      {
        path: s('detailsTypographyPreset'),
        type: 'select',
        label: 'Preset',
        group: 'Typography',
        widget: 'select-inline',
        description: 'Edit presets in theme settings',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'heading-1', label: 'Heading 1' },
          { value: 'heading-2', label: 'Heading 2' },
          { value: 'heading-3', label: 'Heading 3' },
          { value: 'heading-4', label: 'Heading 4' },
          { value: 'heading-5', label: 'Heading 5' },
          { value: 'heading-6', label: 'Heading 6' },
        ],
        sidebar: true,
      },
      {
        path: s('detailsColor'),
        type: 'color',
        label: 'Text color',
        group: 'Appearance',
        widget: 'color',
        sidebar: true,
      },
      {
        path: s('detailsPaddingTop'),
        type: 'number',
        label: 'Top',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('detailsPaddingBottom'),
        type: 'number',
        label: 'Bottom',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('detailsPaddingLeft'),
        type: 'number',
        label: 'Left',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('detailsPaddingRight'),
        type: 'number',
        label: 'Right',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
    ];
  }

  return [
    {
      path: s('excerptTypographyPreset'),
      type: 'select',
      label: 'Preset',
      group: 'Typography',
      widget: 'select-inline',
      description: 'Edit presets in theme settings',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'heading-1', label: 'Heading 1' },
        { value: 'heading-2', label: 'Heading 2' },
        { value: 'heading-3', label: 'Heading 3' },
        { value: 'heading-4', label: 'Heading 4' },
        { value: 'heading-5', label: 'Heading 5' },
        { value: 'heading-6', label: 'Heading 6' },
      ],
      sidebar: true,
    },
    {
      path: s('excerpt'),
      type: 'textarea',
      label: 'Text',
      group: 'Content',
      widget: 'richtext',
      sidebar: true,
    },
    {
      path: s('excerptColor'),
      type: 'color',
      label: 'Text color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('excerptPaddingTop'),
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('excerptPaddingBottom'),
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('excerptPaddingLeft'),
      type: 'number',
      label: 'Left',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('excerptPaddingRight'),
      type: 'number',
      label: 'Right',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
  ];
}

export function blogPostsGridBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = blogPostsGridSectionBaseFromNodeId(nodeId);
  const kind = blogPostsGridBlockKindFromNodeId(nodeId);
  if (!sectionBase || !kind) return [];

  if (kind === 'title') {
    return blogPostsGridBlockFieldDefs(`${sectionBase}.settings`, kind);
  }

  const postId = blogPostsGridTemplatePostIdFromNodeId(nodeId);
  return blogPostsGridBlockFieldDefs(`${sectionBase}.blocks.${postId}.settings`, kind);
}

export function pickBlogPostsGridBlockField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendBlogPostsGridBlockValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null,
  blockKind: BlogPostsGridBlockKind
): Record<string, string | boolean> {
  const defaultsByKind: Record<BlogPostsGridBlockKind, Record<string, string | boolean>> = {
    title: blogPostsGridSectionTitleDefaultSettings(),
    image: blogPostsGridCardImageDefaultSettings(),
    'card-title': blogPostsGridCardTitleDefaultSettings(),
    details: blogPostsGridCardDetailsDefaultSettings(),
    excerpt: blogPostsGridCardExcerptDefaultSettings(),
  };
  const defaults = defaultsByKind[blockKind];
  const next = { ...values };
  for (const field of fields) {
    if (next[field.path] !== undefined) continue;
    const fromConfig = getNested(config, field.path.split('.'));
    if (fromConfig !== undefined && fromConfig !== null) {
      next[field.path] = field.type === 'boolean' ? Boolean(fromConfig) : String(fromConfig);
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback = defaults[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }
  return next;
}

export function isBlogPostsGridSectionTitlePanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    keys.has('heading') &&
    keys.has('headingWidth') &&
    /\.settings\./.test(path) &&
    !/\.blocks\./.test(path) &&
    /blog_posts_(?:grid|editorial|carousel)/.test(path)
  );
}

export function isBlogPostsGridCardImagePanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    keys.has('imageAspectRatio') &&
    keys.has('imageBorderStyle') &&
    /\.blocks\.[^.]+\.settings\./.test(path) &&
    /blog_posts_(?:grid|editorial|carousel)/.test(path)
  );
}

export function isBlogPostsGridCardTitlePanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    keys.has('title') &&
    keys.has('titleTypographyPreset') &&
    /\.blocks\.[^.]+\.settings\./.test(path) &&
    /blog_posts_(?:grid|editorial|carousel)/.test(path)
  );
}

export function isBlogPostsGridCardDetailsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    keys.has('detailsDateEnabled') &&
    keys.has('detailsAuthorEnabled') &&
    /\.blocks\.[^.]+\.settings\./.test(path) &&
    /blog_posts_(?:grid|editorial|carousel)/.test(path)
  );
}

export function isBlogPostsGridCardExcerptPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    keys.has('excerptTypographyPreset') &&
    keys.has('excerptColor') &&
    /\.blocks\.[^.]+\.settings\./.test(path) &&
    /blog_posts_(?:grid|editorial|carousel)/.test(path)
  );
}
