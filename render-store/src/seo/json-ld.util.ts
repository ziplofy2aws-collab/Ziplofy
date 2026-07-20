import type { StorefrontSeoCollection, StorefrontSeoProduct, StorefrontSeoStore } from './seo.types';
import { plainTextFromHtml, truncateSeoText } from './seo-text.util';

export function buildOrganizationJsonLd(
  store: StorefrontSeoStore,
  canonicalUrl: string
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: store.name,
    url: canonicalUrl,
    ...(store.description ? { description: truncateSeoText(plainTextFromHtml(store.description)) } : {}),
  };
}

export function buildProductJsonLd(
  product: StorefrontSeoProduct,
  store: StorefrontSeoStore,
  canonicalUrl: string,
  currencyCode = 'USD'
): Record<string, unknown> {
  const description =
    product.metaDescription?.trim() ||
    truncateSeoText(plainTextFromHtml(product.description ?? ''));

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.pageTitle?.trim() || product.title,
    ...(description ? { description } : {}),
    ...(product.imageUrls?.length ? { image: product.imageUrls } : {}),
    ...(product.price != null
      ? {
          offers: {
            '@type': 'Offer',
            price: String(product.price),
            priceCurrency: currencyCode,
            availability: 'https://schema.org/InStock',
            url: canonicalUrl,
          },
        }
      : {}),
    brand: {
      '@type': 'Brand',
      name: store.name,
    },
  };
}

export function buildCollectionJsonLd(
  collection: StorefrontSeoCollection,
  store: StorefrontSeoStore,
  canonicalUrl: string
): Record<string, unknown> {
  const description =
    collection.metaDescription?.trim() ||
    truncateSeoText(plainTextFromHtml(collection.description ?? ''));

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.pageTitle?.trim() || collection.title,
    ...(description ? { description } : {}),
    ...(collection.imageUrl ? { image: collection.imageUrl } : {}),
    url: canonicalUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: store.name,
    },
  };
}
