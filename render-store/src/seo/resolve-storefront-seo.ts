import {
  buildCollectionJsonLd,
  buildOrganizationJsonLd,
  buildProductJsonLd,
} from './json-ld.util';
import { joinTitle, plainTextFromHtml, truncateSeoText } from './seo-text.util';
import type {
  StorefrontSeoCollection,
  StorefrontSeoPayload,
  StorefrontSeoProduct,
  StorefrontSeoStore,
} from './seo.types';

type ResolveStorefrontSeoInput = {
  pathname: string;
  origin: string;
  store: StorefrontSeoStore;
  product?: StorefrontSeoProduct | null;
  collection?: StorefrontSeoCollection | null;
  currencyCode?: string;
};

function canonicalFromPath(origin: string, pathname: string): string {
  const base = origin.replace(/\/+$/, '');
  return `${base}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

function routeSuffixTitle(pathname: string, storeName: string): StorefrontSeoPayload | null {
  if (pathname.startsWith('/auth/login')) {
    return { title: joinTitle(['Login', storeName]), ogType: 'website' };
  }
  if (pathname.startsWith('/auth/signup')) {
    return { title: joinTitle(['Sign up', storeName]), ogType: 'website' };
  }
  if (pathname.startsWith('/auth/forgot')) {
    return { title: joinTitle(['Forgot password', storeName]), ogType: 'website' };
  }
  if (pathname === '/cart') {
    return { title: joinTitle(['Cart', storeName]), ogType: 'website' };
  }
  if (pathname === '/profile') {
    return { title: joinTitle(['Profile', storeName]), ogType: 'website' };
  }
  if (pathname === '/my-orders') {
    return { title: joinTitle(['Orders', storeName]), ogType: 'website' };
  }
  if (pathname === '/preferences') {
    return { title: joinTitle(['Preferences', storeName]), ogType: 'website' };
  }
  if (pathname === '/search') {
    return { title: joinTitle(['Search', storeName]), ogType: 'website' };
  }
  return null;
}

export function resolveStorefrontSeo(input: ResolveStorefrontSeoInput): StorefrontSeoPayload {
  const { pathname, origin, store, product, collection, currencyCode = 'USD' } = input;
  const storeName = store.name.trim() || 'Store';
  const canonicalUrl = canonicalFromPath(origin, pathname);
  const storeDescription = truncateSeoText(plainTextFromHtml(store.description ?? ''));

  const productMatch = pathname.match(/^\/products\/([^/]+)$/);
  if (productMatch && !product) {
    return {
      title: joinTitle(['Product', storeName]),
      description: storeDescription,
      canonicalUrl,
      ogType: 'website',
      jsonLd: buildOrganizationJsonLd(store, canonicalFromPath(origin, '/')),
    };
  }

  if (productMatch && product) {
    const title = joinTitle([product.pageTitle?.trim() || product.title, storeName]);
    const description =
      product.metaDescription?.trim() ||
      truncateSeoText(plainTextFromHtml(product.description ?? '')) ||
      storeDescription;
    return {
      title,
      description,
      canonicalUrl,
      ogType: 'product',
      ogImage: product.imageUrls?.[0],
      jsonLd: [
        buildOrganizationJsonLd(store, canonicalFromPath(origin, '/')),
        buildProductJsonLd(product, store, canonicalUrl, currencyCode),
      ],
    };
  }

  const collectionMatch = pathname.match(/^\/collections\/([^/]+)$/);
  if (collectionMatch && !collection && collectionMatch[1] !== 'all') {
    return {
      title: joinTitle(['Collection', storeName]),
      description: storeDescription,
      canonicalUrl,
      ogType: 'website',
      jsonLd: buildOrganizationJsonLd(store, canonicalFromPath(origin, '/')),
    };
  }

  if (collectionMatch && collection) {
    const title = joinTitle([collection.pageTitle?.trim() || collection.title, storeName]);
    const description =
      collection.metaDescription?.trim() ||
      truncateSeoText(plainTextFromHtml(collection.description ?? '')) ||
      storeDescription;
    return {
      title,
      description,
      canonicalUrl,
      ogType: 'collection',
      ogImage: collection.imageUrl,
      jsonLd: [
        buildOrganizationJsonLd(store, canonicalFromPath(origin, '/')),
        buildCollectionJsonLd(collection, store, canonicalUrl),
      ],
    };
  }

  if (collectionMatch?.[1] === 'all') {
    return {
      title: joinTitle(['All products', storeName]),
      description: storeDescription || `Browse all products at ${storeName}.`,
      canonicalUrl,
      ogType: 'website',
      jsonLd: buildOrganizationJsonLd(store, canonicalFromPath(origin, '/')),
    };
  }

  const routed = routeSuffixTitle(pathname, storeName);
  if (routed) {
    return {
      ...routed,
      description: storeDescription,
      canonicalUrl,
      jsonLd: buildOrganizationJsonLd(store, canonicalFromPath(origin, '/')),
    };
  }

  return {
    title: storeName,
    description: storeDescription || `Shop online at ${storeName}.`,
    canonicalUrl: canonicalFromPath(origin, '/'),
    ogType: 'website',
    jsonLd: buildOrganizationJsonLd(store, canonicalFromPath(origin, '/')),
  };
}
