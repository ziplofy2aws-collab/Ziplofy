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
      path: `${prefix}.text`,
      type: 'textarea',
      label: 'Text',
      group: 'General',
      sidebar: false,
    },
    {
      path: `${prefix}.motionDirection`,
      type: 'select',
      label: 'Motion direction',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'forward', label: 'Forward' },
        { value: 'reverse', label: 'Reverse' },
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
      path: `${prefix}.layoutGap`,
      type: 'number',
      label: 'Gap',
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
  label: 'Marquee',
  description: 'Scrolling text ticker.',
  settingsFields: sectionSettingsFields('sections.text_marquee_section.settings'),
};

const templateSection = {
  id: 'text_marquee_section',
  type: 'text-marquee',
  label: 'Marquee',
  hasBlocks: false,
  settingsFields: sectionSettingsFields('templates.index.sections.text_marquee_section.settings'),
};

const defaultSection = {
  type: 'text-marquee',
  enabled: true,
  settings: {
    catalogVariant: 'text-marquee',
    text: 'We make things that work better and last longer.',
    motionDirection: 'forward',
    colorScheme: 'scheme-1',
    paddingTop: 24,
    paddingBottom: 24,
    layoutGap: 24,
    customCss: '',
  },
};

function patchSchema(schema) {
  schema.layout.text_marquee_section = layoutSection;
  const indexTpl = schema.templates.find((t) => t.id === 'index');
  const idx = indexTpl.sections.findIndex((s) => s.id === 'text_marquee_section');
  if (idx >= 0) indexTpl.sections[idx] = templateSection;
  else {
    const rtIdx = indexTpl.sections.findIndex((s) => s.id === 'rich_text_section');
    if (rtIdx >= 0) indexTpl.sections.splice(rtIdx + 1, 0, templateSection);
    else indexTpl.sections.push(templateSection);
  }
}

function patchDefault(cfg) {
  cfg.templates.index.sections.text_marquee_section = defaultSection;
  if (!cfg.sections) cfg.sections = {};
  cfg.sections.text_marquee_section = {
    id: 'text_marquee_section',
    ...defaultSection,
  };
}

function patchManifest(manifest) {
  manifest.sectionBlocks = manifest.sectionBlocks ?? {};
  manifest.sectionBlocks['text-marquee'] = [];
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
