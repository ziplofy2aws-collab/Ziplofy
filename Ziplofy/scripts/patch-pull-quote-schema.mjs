import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packDir = path.join(__dirname, '../src/theme-packs/horizon');
const schemaPath = path.join(packDir, 'theme.schema.json');
const defaultPath = path.join(packDir, 'theme.default-config.json');
const manifestPath = path.join(packDir, 'theme.manifest.json');

const COLOR_SCHEME_OPTIONS = [
  { value: 'scheme-1', label: 'Scheme 1' },
  { value: 'scheme-2', label: 'Scheme 2' },
  { value: 'scheme-3', label: 'Scheme 3' },
  { value: 'scheme-4', label: 'Scheme 4' },
];

function sectionSettingsFields(prefix) {
  return [
    {
      path: `${prefix}.quote`,
      type: 'textarea',
      label: 'Quote',
      group: 'General',
      sidebar: false,
    },
    {
      path: `${prefix}.linkLabel`,
      type: 'text',
      label: 'Link label',
      group: 'General',
      sidebar: false,
    },
    {
      path: `${prefix}.linkUrl`,
      type: 'text',
      label: 'Link',
      group: 'General',
      widget: 'link',
      sidebar: false,
    },
    {
      path: `${prefix}.direction`,
      type: 'select',
      label: 'Direction',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'vertical', label: 'Vertical' },
        { value: 'horizontal', label: 'Horizontal' },
      ],
    },
    {
      path: `${prefix}.layoutAlignment`,
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
    {
      path: `${prefix}.position`,
      type: 'select',
      label: 'Position',
      group: 'Layout',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'top', label: 'Top' },
        { value: 'center', label: 'Center' },
        { value: 'bottom', label: 'Bottom' },
      ],
    },
    {
      path: `${prefix}.layoutGap`,
      type: 'number',
      label: 'Gap',
      group: 'Layout',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: `${prefix}.sectionWidth`,
      type: 'select',
      label: 'Width',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
    },
    {
      path: `${prefix}.height`,
      type: 'select',
      label: 'Height',
      group: 'Size',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'auto', label: 'Auto' },
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
    },
    {
      path: `${prefix}.colorScheme`,
      type: 'select',
      label: 'Color scheme',
      group: 'Appearance',
      widget: 'color-scheme',
      sidebar: true,
      options: COLOR_SCHEME_OPTIONS,
    },
    {
      path: `${prefix}.backgroundMedia`,
      type: 'select',
      label: 'Background media',
      group: 'Appearance',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'image', label: 'Image' },
      ],
    },
    {
      path: `${prefix}.backgroundImageUrl`,
      type: 'text',
      label: 'Background image',
      group: 'Appearance',
      sidebar: true,
      placeholder: 'Paste image URL or upload',
    },
    {
      path: `${prefix}.borderStyle`,
      type: 'select',
      label: 'Borders',
      group: 'Appearance',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
    },
    {
      path: `${prefix}.cornerRadius`,
      type: 'number',
      label: 'Corner radius',
      group: 'Appearance',
      widget: 'slider',
      min: 0,
      max: 40,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: `${prefix}.backgroundOverlay`,
      type: 'boolean',
      label: 'Background overlay',
      group: 'Appearance',
      sidebar: true,
    },
    {
      path: `${prefix}.paddingTop`,
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: `${prefix}.paddingBottom`,
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: `${prefix}.customCss`,
      type: 'textarea',
      label: 'Custom CSS',
      group: 'Custom CSS',
      widget: 'accordion',
      sidebar: true,
    },
  ];
}

const layoutSection = {
  label: 'Pull quote',
  description: 'Centered pull quote with optional link.',
  settingsFields: sectionSettingsFields('sections.pull_quote_section.settings'),
};

const templateSection = {
  id: 'pull_quote_section',
  type: 'pull-quote',
  label: 'Pull quote',
  hasBlocks: false,
  settingsFields: sectionSettingsFields('templates.index.sections.pull_quote_section.settings'),
};

const defaultSection = {
  type: 'pull-quote',
  enabled: true,
  settings: {
    catalogVariant: 'pull-quote',
    quote:
      'At the heart of every product lies a unique story, driven by our passion for quality and innovation. Each item enhances your everyday life and sparks joy.',
    linkLabel: 'Shop now',
    linkUrl: '/collections',
    direction: 'vertical',
    layoutAlignment: 'center',
    position: 'center',
    layoutGap: 16,
    sectionWidth: 'page',
    height: 'auto',
    colorScheme: 'scheme-1',
    backgroundMedia: 'none',
    backgroundImageUrl: '',
    borderStyle: 'none',
    cornerRadius: 0,
    backgroundOverlay: false,
    paddingTop: 64,
    paddingBottom: 64,
    customCss: '',
  },
};

function patchSchema(schema) {
  schema.layout.pull_quote_section = layoutSection;
  const indexTpl = schema.templates.find((t) => t.id === 'index');
  const idx = indexTpl.sections.findIndex((s) => s.id === 'pull_quote_section');
  if (idx >= 0) indexTpl.sections[idx] = templateSection;
  else {
    const mcIdx = indexTpl.sections.findIndex((s) => s.id === 'multicolumn_section');
    if (mcIdx >= 0) indexTpl.sections.splice(mcIdx + 1, 0, templateSection);
    else indexTpl.sections.push(templateSection);
  }
}

function patchDefault(cfg) {
  cfg.templates.index.sections.pull_quote_section = defaultSection;
}

function patchManifest(manifest) {
  manifest.sectionBlocks['pull-quote'] = [];
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
