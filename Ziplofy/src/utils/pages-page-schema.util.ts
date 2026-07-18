import type { EditorSchemaDoc } from '../create-theme/sidebar/create-theme-sidebar.types';

const PAGES_TEMPLATE_ID = 'pages';

/** Inject Default page template into the editor schema (blank canvas — sections added by merchant). */
export function withPagesPageSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const templates = schema.templates ?? [];
  if (templates.some((tpl) => tpl.id === PAGES_TEMPLATE_ID)) {
    return schema;
  }

  return {
    ...schema,
    templates: [
      ...templates,
      {
        id: PAGES_TEMPLATE_ID,
        label: 'Default page',
        description: 'Custom store page template (/pages/…)',
        sections: [],
      },
    ],
  };
}
