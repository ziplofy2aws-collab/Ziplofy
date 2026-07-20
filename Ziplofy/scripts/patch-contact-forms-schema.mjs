/**
 * Adds layout blueprints for contact_form + email_signup (footer/header insert)
 * and ensures template sections use sidebar-visible panel fields.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packDir = path.join(__dirname, '../src/theme-packs/horizon');
const schemaPath = path.join(packDir, 'theme.schema.json');
const defaultPath = path.join(packDir, 'theme.default-config.json');
const manifestPath = path.join(packDir, 'theme.manifest.json');

const PANEL_GROUPS = new Set(['Layout', 'Size', 'Appearance', 'Padding', 'Custom CSS']);

function remapFields(fields, fromPrefix, toPrefix) {
  return fields.map((field) => {
    const next = {
      ...field,
      path: field.path.replace(fromPrefix, toPrefix),
    };
    if (next.group && PANEL_GROUPS.has(next.group)) {
      next.sidebar = true;
    }
    return next;
  });
}

function patchSchema(schema) {
  const indexTpl = schema.templates.find((t) => t.id === 'index');
  const tplContact = indexTpl?.sections?.find((s) => s.id === 'contact_form');
  const tplEmail = indexTpl?.sections?.find((s) => s.id === 'email_signup');
  if (!tplContact || !tplEmail) {
    throw new Error('index template missing contact_form or email_signup section');
  }

  schema.layout.contact_form = {
    label: 'Contact form',
    description: 'Let customers send you a message.',
    settingsFields: remapFields(
      tplContact.settingsFields,
      'templates.index.sections.contact_form.settings',
      'sections.contact_form.settings'
    ),
  };

  schema.layout.email_signup = {
    label: 'Email signup',
    description: 'Collect emails with a signup form.',
    settingsFields: remapFields(
      tplEmail.settingsFields,
      'templates.index.sections.email_signup.settings',
      'sections.email_signup.settings'
    ),
  };

  tplContact.settingsFields = remapFields(
    tplContact.settingsFields,
    'templates.index.sections.contact_form.settings',
    'templates.index.sections.contact_form.settings'
  );
  tplEmail.settingsFields = remapFields(
    tplEmail.settingsFields,
    'templates.index.sections.email_signup.settings',
    'templates.index.sections.email_signup.settings'
  );
}

function patchDefault(cfg) {
  const tpl = cfg.templates?.index?.sections;
  if (!tpl?.contact_form || !tpl?.email_signup) {
    throw new Error('default config missing template contact_form or email_signup');
  }

  cfg.sections = cfg.sections ?? {};
  cfg.sections.contact_form = {
    id: 'contact_form',
    type: 'contact-form',
    enabled: true,
    settings: { ...(tpl.contact_form.settings ?? {}) },
    blocks: {},
    block_order: [],
  };
  cfg.sections.email_signup = {
    id: 'email_signup',
    type: 'email-signup',
    enabled: true,
    settings: { ...(tpl.email_signup.settings ?? {}) },
    blocks: {},
    block_order: [],
  };
}

function patchManifest(manifest) {
  manifest.sectionBlocks = manifest.sectionBlocks ?? {};
  manifest.sectionBlocks['contact-form'] = [];
  manifest.sectionBlocks['email-signup'] = [];
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
