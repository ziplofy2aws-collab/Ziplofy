import type { StorefrontSeoPayload } from './seo.types';

const JSON_LD_SCRIPT_ID = 'ziplofy-storefront-seo-jsonld';

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  const selector =
    attr === 'name' ? `meta[name="${key}"]` : `meta[property="${key}"]`;
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function removeMeta(attr: 'name' | 'property', key: string): void {
  const selector =
    attr === 'name' ? `meta[name="${key}"]` : `meta[property="${key}"]`;
  document.querySelector(selector)?.remove();
}

function upsertCanonical(href: string): void {
  let element = document.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function upsertJsonLd(data: StorefrontSeoPayload['jsonLd']): void {
  const existing = document.getElementById(JSON_LD_SCRIPT_ID);
  if (!data) {
    existing?.remove();
    return;
  }

  const payload = Array.isArray(data) ? data : [data];
  let element = existing as HTMLScriptElement | null;
  if (!element) {
    element = document.createElement('script');
    element.id = JSON_LD_SCRIPT_ID;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(payload.length === 1 ? payload[0] : payload);
}

export function applyStorefrontSeoToDocument(seo: StorefrontSeoPayload): void {
  document.title = seo.title;

  if (seo.description) {
    upsertMeta('name', 'description', seo.description);
  } else {
    removeMeta('name', 'description');
  }

  if (seo.canonicalUrl) {
    upsertCanonical(seo.canonicalUrl);
  }

  const ogTitle = seo.title;
  const ogDescription = seo.description ?? '';
  const ogType = seo.ogType ?? 'website';

  upsertMeta('property', 'og:title', ogTitle);
  upsertMeta('property', 'og:type', ogType);
  if (ogDescription) {
    upsertMeta('property', 'og:description', ogDescription);
  } else {
    removeMeta('property', 'og:description');
  }
  if (seo.canonicalUrl) {
    upsertMeta('property', 'og:url', seo.canonicalUrl);
  }
  if (seo.ogImage) {
    upsertMeta('property', 'og:image', seo.ogImage);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:image', seo.ogImage);
  } else {
    removeMeta('property', 'og:image');
    removeMeta('name', 'twitter:image');
    upsertMeta('name', 'twitter:card', 'summary');
  }

  upsertMeta('name', 'twitter:title', ogTitle);
  if (ogDescription) {
    upsertMeta('name', 'twitter:description', ogDescription);
  } else {
    removeMeta('name', 'twitter:description');
  }

  upsertJsonLd(seo.jsonLd);
}
