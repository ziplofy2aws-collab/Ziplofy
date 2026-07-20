import type { AdminSeoPayload } from './seo.types';

const ADMIN_JSON_LD_SCRIPT_ID = 'codiic-admin-seo-jsonld';

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  const selector = attr === 'name' ? `meta[name="${key}"]` : `meta[property="${key}"]`;
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function removeMeta(attr: 'name' | 'property', key: string): void {
  const selector = attr === 'name' ? `meta[name="${key}"]` : `meta[property="${key}"]`;
  document.querySelector(selector)?.remove();
}

export function applyAdminSeoToDocument(seo: AdminSeoPayload): void {
  document.title = seo.title;

  if (seo.description) {
    upsertMeta('name', 'description', seo.description);
  } else {
    removeMeta('name', 'description');
  }

  if (seo.robots) {
    upsertMeta('name', 'robots', seo.robots);
  } else {
    removeMeta('name', 'robots');
  }
}

export function clearAdminJsonLd(): void {
  document.getElementById(ADMIN_JSON_LD_SCRIPT_ID)?.remove();
}
