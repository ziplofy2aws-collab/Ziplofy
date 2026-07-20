import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packDir = path.join(__dirname, '../src/theme-packs/horizon');
const schemaPath = path.join(packDir, 'theme.schema.json');

const FEATURED_PRODUCT_FIELDS = [
  {
    pathSuffix: 'sectionWidth',
    type: 'select',
    label: 'Width',
    group: 'Layout',
    widget: 'segmented',
    sidebar: true,
    options: [
      { value: 'page', label: 'Page' },
      { value: 'full', label: 'Full' },
    ],
  },
  {
    pathSuffix: 'equalColumns',
    type: 'boolean',
    label: 'Equal columns',
    group: 'Layout',
    sidebar: true,
  },
  {
    pathSuffix: 'limitProductDetailsWidth',
    type: 'boolean',
    label: 'Limit product details width',
    group: 'Layout',
    sidebar: true,
  },
  {
    pathSuffix: 'layoutGap',
    type: 'number',
    label: 'Gap',
    group: 'Layout',
    widget: 'slider',
    min: 0,
    max: 120,
    step: 1,
    unit: 'px',
    sidebar: true,
  },
  {
    pathSuffix: 'showRating',
    type: 'boolean',
    label: 'Show rating',
    group: 'Layout',
    sidebar: false,
  },
  {
    pathSuffix: 'rating',
    type: 'number',
    label: 'Rating',
    group: 'Layout',
    sidebar: false,
  },
  {
    pathSuffix: 'reviewCount',
    type: 'number',
    label: 'Review count',
    group: 'Layout',
    sidebar: false,
  },
  {
    pathSuffix: 'showTaxNote',
    type: 'boolean',
    label: 'Show tax note',
    group: 'Layout',
    sidebar: false,
  },
  {
    pathSuffix: 'taxNote',
    type: 'text',
    label: 'Tax note',
    group: 'Layout',
    sidebar: false,
  },
  {
    pathSuffix: 'buttonLabel',
    type: 'text',
    label: 'Button label',
    group: 'Layout',
    sidebar: false,
  },
  {
    pathSuffix: 'soldOut',
    type: 'boolean',
    label: 'Sold out',
    group: 'Layout',
    sidebar: false,
  },
];

function patchProductFieldLabel(fields) {
  return fields.map((f) => {
    if (f.path?.endsWith('.productId')) {
      return { ...f, label: 'Product', group: 'Product', sidebar: true };
    }
    return f;
  });
}

function addFeaturedProductFields(fields, prefix) {
  if (!Array.isArray(fields)) return fields;
  let out = patchProductFieldLabel(fields);
  const hasSectionWidth = out.some((f) => f.path?.endsWith('.sectionWidth'));
  if (!hasSectionWidth && prefix) {
    for (const spec of FEATURED_PRODUCT_FIELDS) {
      out.push({
        path: `${prefix}.${spec.pathSuffix}`,
        type: spec.type,
        label: spec.label,
        group: spec.group,
        widget: spec.widget,
        sidebar: spec.sidebar,
        min: spec.min,
        max: spec.max,
        step: spec.step,
        unit: spec.unit,
        options: spec.options,
      });
    }
  }
  return out;
}

function patchSection(sec, settingsPrefix) {
  if (!sec || sec.type !== 'product-highlight') return sec;
  return {
    ...sec,
    settingsFields: addFeaturedProductFields(sec.settingsFields, settingsPrefix),
  };
}

function patchSchema(schema) {
  if (schema.layout?.product_highlight) {
    schema.layout.product_highlight = patchSection(
      schema.layout.product_highlight,
      'sections.product_highlight.settings'
    );
  }
  const indexTpl = schema.templates?.find((t) => t.id === 'index');
  if (indexTpl?.sections) {
    indexTpl.sections = indexTpl.sections.map((s) => {
      if (s.id === 'product_highlight') {
        return patchSection(s, 'templates.index.sections.product_highlight.settings');
      }
      return s;
    });
  }
}

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
patchSchema(schema);
fs.writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);

const z3b = path.join(__dirname, '../../Ziplofy3b/src/theme-packs/horizon/theme.schema.json');
if (fs.existsSync(path.dirname(z3b))) {
  fs.copyFileSync(schemaPath, z3b);
  console.log('copied to', z3b);
}
console.log('patched featured product schema');
