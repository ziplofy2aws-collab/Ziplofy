/**
 * Align horizon/studio theme packs with bloom depth:
 * - Pretty-printed schema (from bloom template + index section id)
 * - Full default-config metadata (settings_field_order, nested_block_order)
 * - Extra nested schema fields (login forgot link, order card lines, profile email, hero align)
 */
import fs from 'node:fs';
import path from 'node:path';

import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PACKS = path.join(ROOT, 'Ziplofy', 'src', 'theme-packs');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function replaceIndexSectionPaths(str, sectionId) {
  return str.replace(/product_showcase/g, sectionId);
}

function enhanceSchema(schema) {
  const login = schema.templates.find((t) => t.id === 'login');
  const loginSec = login?.sections?.find((s) => s.id === 'login_main');
  if (loginSec && !loginSec.blocks.some((b) => b.id === 'forgot_password_link')) {
    loginSec.blocks.push({
      id: 'forgot_password_link',
      label: 'Forgot password link',
      settingsFields: [
        {
          path: 'templates.login.sections.login_main.blocks.forgot_password_link.settings.label',
          type: 'text',
          label: 'Link label',
        },
        {
          path: 'templates.login.sections.login_main.blocks.forgot_password_link.settings.href',
          type: 'text',
          label: 'Link URL',
        },
      ],
    });
  }

  const hero = schema.templates.find((t) => t.id === 'index')?.sections?.find((s) => s.id === 'hero_main');
  if (hero) {
    const hasAlign = hero.settingsFields?.some((f) => f.path.includes('textAlign'));
    if (!hasAlign) {
      hero.settingsFields = hero.settingsFields || [];
      hero.settingsFields.push({
        path: 'templates.index.sections.hero_main.settings.textAlign',
        type: 'select',
        label: 'Text alignment',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ],
      });
    }
  }

  const profile = schema.templates.find((t) => t.id === 'profile');
  const profileForm = profile?.sections?.[0]?.blocks?.find((b) => b.id === 'profile_form');
  if (profileForm && !profileForm.blocks?.some((b) => b.id === 'email_field')) {
    profileForm.blocks = profileForm.blocks || [];
    profileForm.blocks.unshift({
      id: 'email_field',
      label: 'Email (read-only)',
      settingsFields: [
        {
          path: 'templates.profile.sections.profile_main.blocks.profile_form.blocks.email_field.settings.label',
          type: 'text',
          label: 'Field label',
        },
        {
          path: 'templates.profile.sections.profile_main.blocks.profile_form.blocks.email_field.settings.helperText',
          type: 'text',
          label: 'Helper text',
        },
      ],
    });
  }

  const orders = schema.templates.find((t) => t.id === 'orders');
  const orderCard = orders?.sections?.[0]?.blocks?.find((b) => b.id === 'order_card');
  if (orderCard) {
    orderCard.blocks = orderCard.blocks || [];
    const ids = new Set(orderCard.blocks.map((b) => b.id));
    if (!ids.has('order_total_line')) {
      orderCard.blocks.unshift({
        id: 'order_total_line',
        label: 'Order total',
        settingsFields: [
          {
            path: 'templates.orders.sections.orders_main.blocks.order_card.blocks.order_total_line.settings.label',
            type: 'text',
            label: 'Total label',
          },
        ],
      });
    }
    if (!ids.has('order_date_line')) {
      orderCard.blocks.push({
        id: 'order_date_line',
        label: 'Order date',
        settingsFields: [
          {
            path: 'templates.orders.sections.orders_main.blocks.order_card.blocks.order_date_line.settings.prefix',
            type: 'text',
            label: 'Date prefix',
          },
        ],
      });
    }
  }

  return schema;
}

function enhanceDefaultConfig(dc) {
  const login = dc.templates?.login?.sections?.login_main;
  if (login && !login.blocks.forgot_password_link) {
    login.blocks.forgot_password_link = {
      type: 'forgot-link',
      settings: { label: 'Forgot password?', href: '/auth/forgot-password' },
    };
    login.block_order = [...(login.block_order || []), 'forgot_password_link'];
  }

  const hero = dc.templates?.index?.sections?.hero_main;
  if (hero?.settings && hero.settings.textAlign == null) {
    hero.settings.textAlign = 'center';
  }

  const profileForm = dc.templates?.profile?.sections?.profile_main?.blocks?.profile_form;
  if (profileForm && !profileForm.blocks.email_field) {
    profileForm.blocks.email_field = {
      type: 'email',
      settings: { label: 'Email', helperText: 'Contact email cannot be changed here.' },
    };
    profileForm.block_order = ['email_field', ...(profileForm.block_order || [])];
    profileForm.nested_block_order = profileForm.block_order;
  }

  const orderCard = dc.templates?.orders?.sections?.orders_main?.blocks?.order_card;
  if (orderCard) {
    orderCard.blocks = orderCard.blocks || {};
    if (!orderCard.blocks.order_total_line) {
      orderCard.blocks.order_total_line = { type: 'total-line', settings: { label: 'Total' } };
    }
    if (!orderCard.blocks.order_date_line) {
      orderCard.blocks.order_date_line = { type: 'date-line', settings: { prefix: 'Placed' } };
    }
    orderCard.block_order = ['order_total_line', 'status_line', 'order_date_line'];
    orderCard.nested_block_order = orderCard.block_order;
  }

  return dc;
}

const bloomSchema = readJson(path.join(PACKS, 'bloom', 'theme.schema.json'));
const bloomDc = readJson(path.join(PACKS, 'bloom', 'theme.default-config.json'));

for (const [pack, indexSection, indexLabel] of [
  ['bloom', 'product_showcase', 'Product showcase'],
  ['horizon', 'featured_collection', 'Featured collection'],
  ['studio', 'product_grid', 'Product grid'],
]) {
  let schema = JSON.parse(JSON.stringify(bloomSchema));
  schema.themeId = pack;
  schema.description = `${pack.charAt(0).toUpperCase() + pack.slice(1)} theme editor tree — every configurable UI element mapped to its config path`;
  if (pack !== 'bloom') {
    const raw = JSON.stringify(schema);
    schema = JSON.parse(replaceIndexSectionPaths(raw, indexSection));
    const idx = schema.templates.find((t) => t.id === 'index');
    const sec = idx?.sections?.find((s) => s.id === indexSection);
    if (sec) sec.label = indexLabel;
  }
  schema = enhanceSchema(schema);
  writeJson(path.join(PACKS, pack, 'theme.schema.json'), schema);

  let dc = JSON.parse(JSON.stringify(bloomDc));
  dc.themeId = pack;
  if (pack === 'horizon') {
    dc.themeName = 'Horizon';
    dc.settings.colors = { primary: '#111827', background: '#ffffff', text: '#111827' };
    dc.settings.typography = {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontFamilyBody: 'system-ui, -apple-system, sans-serif',
    };
    dc.templates.index.sections.hero_main.settings = {
      eyebrow: 'New arrivals',
      title: 'Elevate your everyday',
      subtitle: 'Thoughtfully designed products for modern living — quality you can see and feel.',
      textAlign: 'center',
    };
  } else if (pack === 'studio') {
    dc.themeName = 'Studio';
    dc.settings.colors = { primary: '#0f172a', background: '#f8fafc', text: '#0f172a' };
    dc.settings.typography = {
      fontFamily: "'DM Sans', system-ui, sans-serif",
      fontFamilyBody: "'DM Sans', system-ui, sans-serif",
    };
    dc.templates.index.sections.hero_main.settings = {
      eyebrow: 'Studio drop',
      title: 'Design-forward essentials',
      subtitle: 'Curated pieces with clean lines and intentional detail.',
      textAlign: 'center',
    };
  } else {
    dc.themeName = 'Bloom';
  }

  if (pack !== 'bloom') {
    const raw = JSON.stringify(dc);
    dc = JSON.parse(replaceIndexSectionPaths(raw, indexSection));
    const order = dc.templates?.index?.section_order;
    if (order) {
      dc.templates.index.section_order = order.map((id) =>
        id === 'product_showcase' ? indexSection : id
      );
    }
  }
  dc = enhanceDefaultConfig(dc);
  writeJson(path.join(PACKS, pack, 'theme.default-config.json'), dc);
  console.log('Updated', pack);
}

// Ziplofy3b mirror
const b3 = path.join(ROOT, 'Ziplofy3b', 'src', 'theme-packs');
for (const pack of ['bloom', 'horizon', 'studio']) {
  for (const file of ['theme.schema.json', 'theme.default-config.json']) {
    fs.copyFileSync(path.join(PACKS, pack, file), path.join(b3, pack, file));
  }
}
console.log('Synced Ziplofy3b packs');
