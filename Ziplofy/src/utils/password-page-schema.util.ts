import type { EditorSchemaDoc } from '../create-theme/sidebar/create-theme-sidebar.types';

type SchemaTemplate = NonNullable<EditorSchemaDoc['templates']>[number];
type SchemaSection = NonNullable<SchemaTemplate['sections']>[number];

const PASSWORD_TEMPLATE_ID = 'password';
const PASSWORD_MAIN_SECTION_ID = 'password_main';

function passwordMainSection(): SchemaSection {
  const base = `templates.${PASSWORD_TEMPLATE_ID}.sections.${PASSWORD_MAIN_SECTION_ID}`;
  return {
    id: PASSWORD_MAIN_SECTION_ID,
    type: 'password-main',
    label: 'Password',
    hasBlocks: true,
    settingsFields: [],
    blocks: [
      {
        id: 'logo',
        label: 'Logo',
        settingsFields: [
          {
            path: `${base}.blocks.logo.settings.text`,
            type: 'text',
            label: 'Store name',
            sidebar: true,
          },
        ],
      },
      {
        id: 'text',
        label: 'Text',
        settingsFields: [
          {
            path: `${base}.blocks.text.settings.message`,
            type: 'textarea',
            label: 'Message',
            sidebar: true,
          },
        ],
      },
      {
        id: 'password_field',
        label: 'Password input',
        settingsFields: [
          {
            path: `${base}.blocks.password_field.settings.label`,
            type: 'text',
            label: 'Label',
            sidebar: true,
          },
          {
            path: `${base}.blocks.password_field.settings.placeholder`,
            type: 'text',
            label: 'Placeholder',
            sidebar: true,
          },
        ],
      },
      {
        id: 'primary_button',
        label: 'Button',
        settingsFields: [
          {
            path: `${base}.blocks.primary_button.settings.label`,
            type: 'text',
            label: 'Button label',
            sidebar: true,
          },
          {
            path: `${base}.blocks.primary_button.settings.loadingLabel`,
            type: 'text',
            label: 'Loading label',
            sidebar: true,
          },
        ],
      },
    ],
  };
}

/** Inject Password template (password_main with logo / text / input / button) into the editor schema. */
export function withPasswordPageSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const templates = schema.templates ?? [];
  const existingIdx = templates.findIndex((tpl) => tpl.id === PASSWORD_TEMPLATE_ID);
  const passwordTemplate: SchemaTemplate = {
    id: PASSWORD_TEMPLATE_ID,
    label: 'Password',
    description: 'Store password-protection gate',
    sections: [passwordMainSection()],
  };

  if (existingIdx >= 0) {
    const next = [...templates];
    next[existingIdx] = passwordTemplate;
    return { ...schema, templates: next };
  }

  return {
    ...schema,
    templates: [...templates, passwordTemplate],
  };
}
