/**
 * Sync Shopify-style announcement bar settings into theme pack schema + default-config.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const settingsFields = [
  {
    path: 'sections.announcement_bar.settings.timeToNext',
    type: 'number',
    label: 'Time to next announcement',
    group: 'General',
    widget: 'slider',
    min: 2,
    max: 30,
    step: 1,
    unit: 'sec',
    sidebar: false,
  },
  {
    path: 'sections.announcement_bar.settings.sectionWidth',
    type: 'select',
    label: 'Section width',
    group: 'Appearance',
    widget: 'segmented',
    options: [
      { value: 'page', label: 'Page' },
      { value: 'full', label: 'Full' },
    ],
    sidebar: false,
  },
  {
    path: 'sections.announcement_bar.settings.colorScheme',
    type: 'select',
    label: 'Color scheme',
    group: 'Appearance',
    widget: 'color-scheme',
    options: [
      { value: 'scheme-1', label: 'Scheme 1' },
      { value: 'scheme-2', label: 'Scheme 2' },
      { value: 'scheme-3', label: 'Scheme 3' },
      { value: 'scheme-4', label: 'Scheme 4' },
    ],
    sidebar: false,
  },
  {
    path: 'sections.announcement_bar.settings.dividerThickness',
    type: 'number',
    label: 'Divider thickness',
    group: 'Appearance',
    widget: 'slider',
    min: 0,
    max: 20,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: 'sections.announcement_bar.settings.paddingTop',
    type: 'number',
    label: 'Top',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: 'sections.announcement_bar.settings.paddingBottom',
    type: 'number',
    label: 'Bottom',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
    sidebar: false,
  },
  {
    path: 'sections.announcement_bar.settings.customCss',
    type: 'textarea',
    label: 'Custom CSS',
    group: 'Custom CSS',
    widget: 'accordion',
    sidebar: false,
  },
  {
    path: 'sections.announcement_bar.settings.enabled',
    type: 'boolean',
    label: 'Show announcement',
    sidebar: false,
  },
];

const defaultSettingsPatch = {
  timeToNext: 5,
  sectionWidth: 'page',
  colorScheme: 'scheme-4',
  dividerThickness: 0,
  paddingTop: 15,
  paddingBottom: 15,
  customCss: '',
  dismissible: false,
  icon: '',
};

const packs = ['bloom', 'horizon', 'studio'];
const roots = [
  path.join(root, 'Ziplofy', 'src', 'theme-packs'),
  path.join(root, 'Ziplofy3b', 'src', 'theme-packs'),
];

for (const packsRoot of roots) {
  if (!fs.existsSync(packsRoot)) continue;
  for (const pack of packs) {
    const schemaPath = path.join(packsRoot, pack, 'theme.schema.json');
    const cfgPath = path.join(packsRoot, pack, 'theme.default-config.json');
    if (!fs.existsSync(schemaPath) || !fs.existsSync(cfgPath)) continue;

    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    if (schema.layout?.announcement_bar) {
      schema.layout.announcement_bar.settingsFields = settingsFields;
      fs.writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);
      console.log('schema', schemaPath);
    }

    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    const sec = cfg.sections?.announcement_bar;
    if (sec?.settings) {
      Object.assign(sec.settings, defaultSettingsPatch);
      if (sec.settings.enabled === undefined) sec.settings.enabled = true;
      fs.writeFileSync(cfgPath, `${JSON.stringify(cfg, null, 2)}\n`);
      console.log('config', cfgPath);
    }
  }
}
