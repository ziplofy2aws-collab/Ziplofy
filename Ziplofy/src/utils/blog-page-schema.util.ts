import type { EditorSchemaDoc } from '../create-theme/sidebar/create-theme-sidebar.types';

type SchemaTemplate = NonNullable<EditorSchemaDoc['templates']>[number];
type SchemaSection = NonNullable<SchemaTemplate['sections']>[number];

function mainBlogSection(templateId: string): SchemaSection {
  return {
    id: 'main_blog',
    type: 'main-blog',
    label: 'Blog',
    hasBlocks: true,
    settingsFields: [],
    blocks: [
      {
        id: 'title',
        label: 'Title',
        settingsFields: [
          {
            path: `templates.${templateId}.sections.main_blog.blocks.title.settings.text`,
            type: 'textarea',
            label: 'Text',
            sidebar: true,
          },
        ],
      },
    ],
  };
}

function blogPostMainSection(templateId: string): SchemaSection {
  return {
    id: 'blog_post_main',
    type: 'blog-post-main',
    label: 'Blog posts',
    hasBlocks: true,
    settingsFields: [],
    blocks: [
      {
        id: 'title',
        label: 'Title',
        settingsFields: [
          {
            path: `templates.${templateId}.sections.blog_post_main.blocks.title.settings.text`,
            type: 'textarea',
            label: 'Text',
            sidebar: true,
          },
        ],
      },
      {
        id: 'blog_post',
        label: 'Blog post',
        settingsFields: [],
        blocks: [
          { id: 'image', label: 'Image', settingsFields: [] },
          { id: 'title', label: 'Title', settingsFields: [] },
          { id: 'details', label: 'Details', settingsFields: [] },
          { id: 'description', label: 'Description', settingsFields: [] },
        ],
      },
    ],
  };
}

function blogsTemplate(): SchemaTemplate {
  return {
    id: 'blogs',
    label: 'Default blog',
    sections: [mainBlogSection('blogs')],
  };
}

function blogPostsTemplate(): SchemaTemplate {
  return {
    id: 'blog-posts',
    label: 'Default blog post',
    sections: [blogPostMainSection('blog-posts')],
  };
}

/** Ensure editor schema includes blogs + blog-posts templates so sidebar can resolve sections. */
export function withBlogPageSchemas(schema: EditorSchemaDoc): EditorSchemaDoc {
  const templates = [...(schema.templates ?? [])];
  let changed = false;

  if (!templates.some((tpl) => tpl.id === 'blogs')) {
    templates.push(blogsTemplate());
    changed = true;
  } else {
    const idx = templates.findIndex((tpl) => tpl.id === 'blogs');
    const tpl = templates[idx]!;
    const sections = [...(tpl.sections ?? [])];
    if (!sections.some((s) => s.id === 'main_blog')) {
      sections.push(mainBlogSection('blogs'));
      templates[idx] = { ...tpl, sections };
      changed = true;
    }
  }

  if (!templates.some((tpl) => tpl.id === 'blog-posts')) {
    templates.push(blogPostsTemplate());
    changed = true;
  } else {
    const idx = templates.findIndex((tpl) => tpl.id === 'blog-posts');
    const tpl = templates[idx]!;
    const sections = [...(tpl.sections ?? [])];
    if (!sections.some((s) => s.id === 'blog_post_main')) {
      sections.push(blogPostMainSection('blog-posts'));
      templates[idx] = { ...tpl, sections };
      changed = true;
    }
  }

  return changed ? { ...schema, templates } : schema;
}
