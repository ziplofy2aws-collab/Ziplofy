import { describe, expect, it } from 'vitest';
import { resolveStorefrontSeo } from './resolve-storefront-seo';

const store = { name: 'ABC Gaming Store', description: 'Premium gaming gear.' };

describe('resolveStorefrontSeo', () => {
  it('uses store name on homepage', () => {
    const seo = resolveStorefrontSeo({
      pathname: '/',
      origin: 'https://abc.ziplofy.com',
      store,
    });

    expect(seo.title).toBe('ABC Gaming Store');
    expect(seo.canonicalUrl).toBe('https://abc.ziplofy.com/');
    expect(seo.jsonLd).toBeTruthy();
  });

  it('uses product SEO fields when available', () => {
    const seo = resolveStorefrontSeo({
      pathname: '/products/64abc',
      origin: 'https://abc.ziplofy.com',
      store,
      product: {
        _id: '64abc',
        title: 'Gaming Mouse',
        pageTitle: 'Pro Gaming Mouse',
        metaDescription: 'Buy the pro gaming mouse today.',
        imageUrls: ['https://abc.ziplofy.com/uploads/mouse.jpg'],
        price: 1499,
      },
    });

    expect(seo.title).toBe('Pro Gaming Mouse - ABC Gaming Store');
    expect(seo.description).toBe('Buy the pro gaming mouse today.');
    expect(seo.ogType).toBe('product');
    expect(seo.ogImage).toBe('https://abc.ziplofy.com/uploads/mouse.jpg');
    expect(Array.isArray(seo.jsonLd)).toBe(true);
  });

  it('uses collection SEO fields when available', () => {
    const seo = resolveStorefrontSeo({
      pathname: '/collections/gaming-accessories',
      origin: 'https://abc.ziplofy.com',
      store,
      collection: {
        title: 'Gaming Accessories',
        pageTitle: 'Gaming Accessories Collection',
        metaDescription: 'Shop gaming accessories.',
        imageUrl: 'https://abc.ziplofy.com/uploads/collection.jpg',
      },
    });

    expect(seo.title).toBe('Gaming Accessories Collection - ABC Gaming Store');
    expect(seo.description).toBe('Shop gaming accessories.');
    expect(seo.ogType).toBe('collection');
  });
});
