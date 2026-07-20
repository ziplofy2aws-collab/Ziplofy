/**
 * Removes hardcoded merchant-copy fallbacks from cfgString() calls.
 * Structural/layout defaults are preserved; copy comes from theme.default-config.json only.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '../src');

const KEEP_FALLBACKS = new Set([
  'scheme-1',
  'scheme-2',
  'scheme-3',
  'scheme-4',
  'scheme-5',
  'scheme-6',
  'page',
  'full',
  'auto',
  'small',
  'medium',
  'large',
  'vertical',
  'horizontal',
  'left',
  'right',
  'center',
  'top',
  'bottom',
  'space-between',
  'grid',
  'carousel',
  'arrows',
  'circle',
  'chevron',
  'large-arrows',
  'none',
  'solid',
  'image',
  'video',
  'url',
  'heading-1',
  'heading-2',
  'heading-3',
  'heading-4',
  'body',
  'paragraph',
  'subheading',
  '14px',
  '12px',
  'default',
  'fit',
  'fill',
  'on-media',
  'under-media',
  'forward',
  'backward',
  'figure',
  'star',
  'customer-account',
  'en',
  'folded-shirts',
  'sewing',
  'collection-links-spotlight',
  'collection-links-text',
  'spotlight',
  'text',
  'link',
  'button',
  '2',
  'false',
  'true',
  '#12121266',
  '#d45454',
  '#111827',
  '#ffffff',
  'gradient',
  'icons',
  'heading',
  'announcement',
  'newsletter',
  'copyright',
  'policy_links',
  'social',
]);

function shouldKeepFallback(fb) {
  if (KEEP_FALLBACKS.has(fb)) return true;
  if (/^scheme-\d+$/.test(fb)) return true;
  if (/^#\w{3,8}$/i.test(fb)) return true;
  if (/^\/[\w/-]*$/.test(fb)) return true;
  if (/^\d+(\.\d+)?$/.test(fb)) return true;
  if (fb.length <= 3 && !/\s/.test(fb)) return true;
  return false;
}

function stripCfgStringCalls(content) {
  return content.replace(/cfgString\(([^)]+),\s*'([^']*)'\)/g, (match, args, fallback) => {
    if (shouldKeepFallback(fallback)) return match;
    return `cfgString(${args})`;
  });
}

function stripStringCoalesce(content) {
  const copyDefaults = [
    'New arrivals',
    'Shop now',
    'Shop by collection',
    'Blog posts',
    'Related products',
    'Discover elevated design',
    'Shop the look',
    'Product title',
    'Rs. 19.99',
    'Collection title',
    'Slide title',
    'Title',
    'Date',
    'Author',
    "An excerpt of your blog post's content",
    'Made with care and best-in-class materials',
  ];
  let out = content;
  for (const def of copyDefaults) {
    const escaped = def.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`\\?\\? '${escaped}'`, 'g'), "?? ''");
    out = out.replace(new RegExp(`\\?\\? "${escaped}"`, 'g'), '?? ""');
  }
  return out;
}

function walk(dir) {
  let changed = 0;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      changed += walk(full);
    } else if (/\.tsx?$/.test(name)) {
      const before = fs.readFileSync(full, 'utf8');
      let after = stripCfgStringCalls(before);
      after = stripStringCoalesce(after);
      if (after !== before) {
        fs.writeFileSync(full, after);
        console.log('updated', path.relative(SRC, full));
        changed++;
      }
    }
  }
  return changed;
}

const n = walk(SRC);
console.log(`Done. ${n} file(s) updated.`);
