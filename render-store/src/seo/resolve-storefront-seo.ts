import {
  buildCollectionJsonLd,
  buildOrganizationJsonLd,
  buildProductJsonLd,
} from './json-ld.util';
import { joinTitle, plainTextFromHtml, truncateSeoText } from './seo-text.util';
import type {
  StorefrontSeoBlog,
  StorefrontSeoBlogPost,
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
  blog?: StorefrontSeoBlog | null;
  blogPost?: StorefrontSeoBlogPost | null;
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
  if (pathname === '/404') {
    return {
      title: joinTitle(['Page not found', storeName]),
      ogType: 'website',
      robots: 'noindex, follow',
    };
  }
  return null;
}

export function resolveStorefrontSeo(input: ResolveStorefrontSeoInput): StorefrontSeoPayload {
  const { pathname, origin, store, product, collection, blog, blogPost, currencyCode = 'USD' } = input;
  const storeName = store.name.trim() || 'Store';
  const canonicalUrl = canonicalFromPath(origin, pathname);
  const storeDescription =
    store.seoMetaDescription?.trim() ||
    truncateSeoText(plainTextFromHtml(store.description ?? ''));
  const homePageTitle = store.seoHomePageTitle?.trim() || storeName;
  const homeOgImage = store.seoSocialImageUrl?.trim() || undefined;

  const productMatch =
    pathname.match(/^\/product\/([^/]+)$/) ?? pathname.match(/^\/products\/([^/]+)$/);
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

  const collectionSingularMatch = pathname.match(/^\/collection\/([^/]+)$/);
  const collectionMatch =
    pathname === '/collections'
      ? (['', 'index'] as RegExpMatchArray)
      : pathname.match(/^\/collections\/([^/]+)$/) ?? collectionSingularMatch;
  if (collectionMatch && collectionMatch[1] === 'index' && !collection) {
    return {
      title: joinTitle(['Collections', storeName]),
      description: storeDescription || `Browse collections at ${storeName}.`,
      canonicalUrl,
      ogType: 'website',
      jsonLd: buildOrganizationJsonLd(store, canonicalFromPath(origin, '/')),
    };
  }

  if (collectionMatch && !collection && collectionMatch[1] !== 'all' && collectionMatch[1] !== 'index') {
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

  const blogPostMatch = pathname.match(/^\/blogs\/([^/]+)\/([^/]+)$/);
  if (blogPostMatch && !blogPost) {
    return {
      title: joinTitle(['Article', storeName]),
      description: storeDescription,
      canonicalUrl,
      ogType: 'website',
      jsonLd: buildOrganizationJsonLd(store, canonicalFromPath(origin, '/')),
    };
  }

  if (blogPostMatch && blogPost) {
    const blogHandle = blog?.urlHandle?.trim() || blogPostMatch[1];
    const postHandle = blogPost.urlHandle?.trim() || blogPostMatch[2];
    const title = joinTitle([blogPost.pageTitle?.trim() || blogPost.title, storeName]);
    const description =
      blogPost.metaDescription?.trim() ||
      truncateSeoText(plainTextFromHtml(blogPost.excerpt ?? blogPost.content ?? '')) ||
      storeDescription;
    return {
      title,
      description,
      canonicalUrl: canonicalFromPath(origin, `/blogs/${blogHandle}/${postHandle}`),
      ogType: 'website',
      ogImage: blogPost.featuredImageUrl,
      jsonLd: buildOrganizationJsonLd(store, canonicalFromPath(origin, '/')),
    };
  }

  const blogMatch = pathname.match(/^\/blogs\/([^/]+)$/);
  if (blogMatch && !blog) {
    return {
      title: joinTitle(['Blog', storeName]),
      description: storeDescription,
      canonicalUrl,
      ogType: 'website',
      jsonLd: buildOrganizationJsonLd(store, canonicalFromPath(origin, '/')),
    };
  }

  if (blogMatch && blog) {
    const blogHandle = blog.urlHandle?.trim() || blogMatch[1];
    const title = joinTitle([blog.pageTitle?.trim() || blog.title, storeName]);
    const description = blog.metaDescription?.trim() || storeDescription;
    return {
      title,
      description,
      canonicalUrl: canonicalFromPath(origin, `/blogs/${blogHandle}`),
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
    title: homePageTitle,
    description: storeDescription || `Shop online at ${storeName}.`,
    canonicalUrl: canonicalFromPath(origin, '/'),
    ogType: 'website',
    ogImage: homeOgImage,
    jsonLd: buildOrganizationJsonLd(store, canonicalFromPath(origin, '/')),
  };
}
