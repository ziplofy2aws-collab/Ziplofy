import fs from 'fs';

const text = fs.readFileSync(
  'C:/Users/dell/.cursor/projects/c-Work-merged-ziplofy/agent-tools/31167208-dc13-4575-a04d-34d31a9850ec.txt',
  'utf8'
);
const fenceMatch = text.match(/```json\r?\n/);
if (!fenceMatch) throw new Error('json fence not found');
const start = fenceMatch.index + fenceMatch[0].length;
const end = text.indexOf('\n```', start);
const fonts = JSON.parse(text.slice(start, end));

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const system = [
  { value: 'default', label: 'Default', family: 'inherit', googleFont: null },
  {
    value: 'mono',
    label: 'Mono',
    family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace',
    googleFont: null,
  },
  { value: 'sans-serif', label: 'Sans-serif', family: 'sans-serif', googleFont: null },
  { value: 'serif', label: 'Serif', family: 'serif', googleFont: null },
  {
    value: 'system-ui',
    label: 'System UI',
    family: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    googleFont: null,
  },
  {
    value: 'arial',
    label: 'Arial',
    family: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    googleFont: null,
  },
];

const google = fonts.map((f) => ({
  value: slug(f.label),
  label: f.label,
  family: `"${f.label.replace(/"/g, '')}", sans-serif`,
  googleFont: f.label.replace(/_/g, ' '),
}));

const all = [...system, ...google];
const outPath = 'c:/Work/merged-ziplofy-/Ziplofy/src/create-theme/checkout/settings/checkout-typography-fonts.json';
fs.writeFileSync(outPath, JSON.stringify(all, null, 2));
console.log('Wrote', all.length, 'fonts to', outPath);
