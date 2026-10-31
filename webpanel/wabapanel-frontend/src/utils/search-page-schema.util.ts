import type { EditorSchemaDoc } from '../create-theme/sidebar/create-theme-sidebar.types';

type SchemaTemplate = NonNullable<EditorSchemaDoc['templates']>[number];
type SchemaSection = NonNullable<SchemaTemplate['sections']>[number];

const SEARCH_TEMPLATE_ID = 'search';
const SEARCH_SECTION_ID = 'search';
const SEARCH_RESULTS_SECTION_ID = 'search_results';

function searchSection(): SchemaSection {
  const base = `templates.${SEARCH_TEMPLATE_ID}.sections.${SEARCH_SECTION_ID}`;
  return {
    id: SEARCH_SECTION_ID,
    type: 'search',
    label: 'Search',
    hasBlocks: true,
    settingsFields: [
      {
        path: `${base}.settings.paddingTop`,
        type: 'number',
        label: 'Top',
        group: 'Padding',
        sidebar: true,
      },
      {
        path: `${base}.settings.paddingBottom`,
        type: 'number',
        label: 'Bottom',
        group: 'Padding',
        sidebar: true,
      },
    ],
    blocks: [
      {
        id: 'heading',
        label: 'Heading',
        settingsFields: [
          {
            path: `${base}.blocks.heading.settings.text`,
            type: 'textarea',
            label: 'Text',
            sidebar: true,
          },
        ],
      },
      {
        id: 'search_input',
        label: 'Search input',
        settingsFields: [
          {
            path: `${base}.blocks.search_input.settings.placeholder`,
            type: 'text',
            label: 'Placeholder',
            sidebar: true,
          },
        ],
      },
    ],
  };
}

function searchResultsSection(): SchemaSection {
  const base = `templates.${SEARCH_TEMPLATE_ID}.sections.${SEARCH_RESULTS_SECTION_ID}`;
  return {
    id: SEARCH_RESULTS_SECTION_ID,
    type: 'search-results',
    label: 'Search results',
    hasBlocks: true,
    settingsFields: [
      {
        path: `${base}.settings.resultsHeading`,
        type: 'text',
        label: 'Heading',
        group: 'General',
        sidebar: true,
      },
      {
        path: `${base}.settings.columns`,
        type: 'number',
        label: 'Columns',
        group: 'Layout',
        sidebar: true,
      },
      {
        path: `${base}.settings.paddingTop`,
        type: 'number',
        label: 'Top',
        group: 'Padding',
        sidebar: true,
      },
      {
        path: `${base}.settings.paddingBottom`,
        type: 'number',
        label: 'Bottom',
        group: 'Padding',
        sidebar: true,
      },
    ],
    blocks: [
      {
        id: 'filtering_and_sorting',
        label: 'Filtering and sorting',
        settingsFields: [
          {
            path: `${base}.blocks.filtering_and_sorting.settings.enableFiltering`,
            type: 'boolean',
            label: 'Enable filtering',
            sidebar: true,
          },
          {
            path: `${base}.blocks.filtering_and_sorting.settings.enableSorting`,
            type: 'boolean',
            label: 'Enable sorting',
            sidebar: true,
          },
        ],
      },
      {
        id: 'product_card',
        label: 'Product card',
        settingsFields: [
          {
            path: `${base}.blocks.product_card.settings.showMedia`,
            type: 'boolean',
            label: 'Show media',
            sidebar: true,
          },
          {
            path: `${base}.blocks.product_card.settings.showTitle`,
            type: 'boolean',
            label: 'Show title',
            sidebar: true,
          },
          {
            path: `${base}.blocks.product_card.settings.showPrice`,
            type: 'boolean',
            label: 'Show price',
            sidebar: true,
          },
        ],
      },
    ],
  };
}

/** Inject Search template (search + search_results) into the editor schema. */
export function withSearchPageSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const templates = schema.templates ?? [];
  const existingIdx = templates.findIndex((tpl) => tpl.id === SEARCH_TEMPLATE_ID);
  const searchTemplate: SchemaTemplate = {
    id: SEARCH_TEMPLATE_ID,
    label: 'Search',
    description: 'Storefront search page (/search)',
    sections: [searchSection(), searchResultsSection()],
  };

  if (existingIdx >= 0) {
    const next = [...templates];
    next[existingIdx] = searchTemplate;
    return { ...schema, templates: next };
  }

  return {
    ...schema,
    templates: [...templates, searchTemplate],
  };
}
