import type {
  EditorFieldDef,
  EditorSchemaDoc,
} from '../create-theme/sidebar/create-theme-sidebar.types';
import { textBlockFieldDefs } from '../create-theme/sidebar/theme-editor-text-block-panel.utils';
import { notFoundMainContainerFieldDefs } from '../create-theme/sidebar/theme-editor-not-found-main-panel.utils';

const NOT_FOUND_TEMPLATE_ID = '404';
const NOT_FOUND_MAIN_SECTION_ID = 'not_found_main';
const NOT_FOUND_FEATURED_COLLECTION_SECTION_ID = 'featured_collection';

function replaceTemplatePaths(value: unknown, from: string, to: string): unknown {
  if (typeof value === 'string') {
    return value.split(from).join(to);
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceTemplatePaths(item, from, to));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      out[key] = replaceTemplatePaths(child, from, to);
    }
    return out;
  }
  return value;
}

function notFoundButtonFieldDefs(): EditorFieldDef[] {
  const base = `templates.${NOT_FOUND_TEMPLATE_ID}.sections.${NOT_FOUND_MAIN_SECTION_ID}.blocks.primary_button.settings`;
  return [
    {
      path: `${base}.label`,
      type: 'text',
      label: 'Label',
      group: 'Content',
      sidebar: true,
    },
    {
      path: `${base}.href`,
      type: 'text',
      label: 'Link',
      group: 'Content',
      sidebar: true,
    },
    {
      path: `${base}.openInNewTab`,
      type: 'boolean',
      label: 'Open this link in a new tab',
      group: 'Content',
      sidebar: true,
    },
    {
      path: `${base}.buttonStyle`,
      type: 'select',
      label: 'Style',
      group: 'Appearance',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
      ],
    },
    {
      path: `${base}.desktopWidth`,
      type: 'select',
      label: 'Desktop width',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      path: `${base}.desktopCustomWidth`,
      type: 'number',
      label: 'Custom width',
      group: 'Size',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: `${base}.mobileWidth`,
      type: 'select',
      label: 'Mobile width',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      path: `${base}.mobileCustomWidth`,
      type: 'number',
      label: 'Custom width',
      group: 'Size',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
  ];
}

function notFoundMainSection(): NonNullable<
  NonNullable<EditorSchemaDoc['templates']>[number]['sections']
>[number] {
  const settingsBase = `templates.${NOT_FOUND_TEMPLATE_ID}.sections.${NOT_FOUND_MAIN_SECTION_ID}.settings`;
  const messageBase = `templates.${NOT_FOUND_TEMPLATE_ID}.sections.${NOT_FOUND_MAIN_SECTION_ID}.blocks.message`;
  return {
    id: NOT_FOUND_MAIN_SECTION_ID,
    type: 'not-found-main',
    label: '404',
    hasBlocks: true,
    settingsFields: notFoundMainContainerFieldDefs(settingsBase),
    blocks: [
      {
        id: 'heading',
        label: 'Text',
        /** Empty so prepare falls through to canonical Heading panel (title + typography). */
        settingsFields: [],
      },
      {
        id: 'message',
        label: 'Text',
        settingsFields: textBlockFieldDefs(messageBase),
      },
      {
        id: 'primary_button',
        label: 'Button',
        settingsFields: notFoundButtonFieldDefs(),
      },
    ],
  };
}

/** Inject 404 template schema (404 message + featured collection carousel). */
export function withNotFoundPageSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const templates = schema.templates ?? [];
  const index = templates.find((tpl) => tpl.id === 'index');
  const featured = index?.sections?.find((s) => s.id === NOT_FOUND_FEATURED_COLLECTION_SECTION_ID);

  const featuredFor404 = featured
    ? (replaceTemplatePaths(
        JSON.parse(JSON.stringify(featured)),
        'templates.index',
        `templates.${NOT_FOUND_TEMPLATE_ID}`
      ) as NonNullable<NonNullable<EditorSchemaDoc['templates']>[number]['sections']>[number])
    : undefined;

  const notFoundTemplate = {
    id: NOT_FOUND_TEMPLATE_ID,
    label: '404 page',
    description: 'Not found page',
    sections: [
      notFoundMainSection(),
      ...(featuredFor404 ? [featuredFor404] : []),
    ],
  } as NonNullable<EditorSchemaDoc['templates']>[number];

  const existingIdx = templates.findIndex((tpl) => tpl.id === NOT_FOUND_TEMPLATE_ID);
  if (existingIdx >= 0) {
    const next = [...templates];
    next[existingIdx] = notFoundTemplate;
    return { ...schema, templates: next };
  }

  return {
    ...schema,
    templates: [...templates, notFoundTemplate],
  };
}
