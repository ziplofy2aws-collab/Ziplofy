import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packDir = path.join(__dirname, '../src/theme-packs/horizon');
const schemaPath = path.join(packDir, 'theme.schema.json');
const defaultPath = path.join(packDir, 'theme.default-config.json');

const NAV_FIELDS = [
  {
    pathSuffix: 'navIcon',
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
    pathSuffix: 'navIconBackground',
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
];

const SIDEBAR_GROUPS = new Set(['Collection', 'Section layout', 'Padding', 'Carousel navigation', 'Custom CSS']);

function patchSettingsFields(fields, prefix) {
  if (!Array.isArray(fields)) return fields;
  const out = fields.map((f) => {
    if (f.group && SIDEBAR_GROUPS.has(f.group)) {
      return { ...f, sidebar: true };
    }
    return f;
  });
  const hasNav = out.some((f) => f.path?.endsWith('.navIcon'));
  if (!hasNav && prefix) {
    for (const nf of NAV_FIELDS) {
      out.push({
        path: `${prefix}.${nf.pathSuffix}`,
        type: nf.type,
        label: nf.label,
        group: nf.group,
        widget: nf.widget,
        sidebar: nf.sidebar,
        options: nf.options,
      });
    }
  }
  return out;
}

function patchFeaturedCollectionSection(sec, settingsPrefix) {
  if (!sec || sec.type !== 'featured-collection') return sec;
  return {
    ...sec,
    settingsFields: patchSettingsFields(sec.settingsFields, settingsPrefix),
  };
}

function patchSchema(schema) {
  const indexTpl = schema.templates?.find((t) => t.id === 'index');
  if (indexTpl?.sections) {
    indexTpl.sections = indexTpl.sections.map((s) => {
      if (s.id === 'featured_collection') {
        return patchFeaturedCollectionSection(
          s,
          'templates.index.sections.featured_collection.settings'
        );
      }
      return s;
    });
  }
  if (schema.layout?.featured_collection) {
    schema.layout.featured_collection = {
      ...schema.layout.featured_collection,
      settingsFields: patchSettingsFields(
        schema.layout.featured_collection.settingsFields,
        'sections.featured_collection.settings'
      ),
    };
  }
}

function patchDefault(cfg) {
  const sec = cfg.templates?.index?.sections?.featured_collection;
  if (!sec?.settings) return;
  sec.settings.navIcon = sec.settings.navIcon ?? 'arrows';
  sec.settings.navIconBackground = sec.settings.navIconBackground ?? 'circle';
  sec.settings.catalogVariant = sec.settings.catalogVariant ?? 'featured-collection';
}

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
patchSchema(schema);
fs.writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);

const cfg = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
patchDefault(cfg);
fs.writeFileSync(defaultPath, `${JSON.stringify(cfg, null, 2)}\n`);

const z3b = path.join(__dirname, '../../Ziplofy3b/src/theme-packs/horizon');
for (const name of ['theme.schema.json', 'theme.default-config.json']) {
  const dest = path.join(z3b, name);
  if (fs.existsSync(path.dirname(dest))) {
    fs.copyFileSync(path.join(packDir, name), dest);
    console.log('copied to', dest);
  }
}
console.log('patched featured collection carousel schema');
