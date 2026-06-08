import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packDir = path.join(__dirname, '../src/theme-packs/horizon');
const schemaPath = path.join(packDir, 'theme.schema.json');
const defaultPath = path.join(packDir, 'theme.default-config.json');

function addEditorialLayoutOption(fields) {
  if (!Array.isArray(fields)) return fields;
  return fields.map((f) => {
    if (!f.path?.endsWith('.layoutType')) return f;
    const options = [...(f.options ?? [])];
    if (!options.some((o) => o.value === 'editorial')) {
      options.push({ value: 'editorial', label: 'Editorial' });
    }
    return {
      ...f,
      widget: options.length > 2 ? 'select' : f.widget,
      options,
    };
  });
}

function patchSection(sec) {
  if (!sec || sec.type !== 'featured-collection') return sec;
  return {
    ...sec,
    settingsFields: addEditorialLayoutOption(sec.settingsFields),
  };
}

function patchSchema(schema) {
  const indexTpl = schema.templates?.find((t) => t.id === 'index');
  if (indexTpl?.sections) {
    indexTpl.sections = indexTpl.sections.map((s) =>
      s.id === 'featured_collection' ? patchSection(s) : s
    );
  }
  if (schema.layout?.featured_collection) {
    schema.layout.featured_collection = {
      ...schema.layout.featured_collection,
      settingsFields: addEditorialLayoutOption(schema.layout.featured_collection.settingsFields),
    };
  }
}

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
patchSchema(schema);
fs.writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);

const z3b = path.join(__dirname, '../../Ziplofy3b/src/theme-packs/horizon');
for (const name of ['theme.schema.json']) {
  const dest = path.join(z3b, name);
  if (fs.existsSync(path.dirname(dest))) {
    fs.copyFileSync(path.join(packDir, name), dest);
    console.log('copied to', dest);
  }
}
console.log('patched featured collection editorial schema');
