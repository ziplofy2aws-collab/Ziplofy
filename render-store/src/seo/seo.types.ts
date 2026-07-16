export type StorefrontSeoPayload = {
  title: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'product' | 'collection';
  ogImage?: string;
  robots?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export type StorefrontSeoStore = {
  name: string;
  description?: string;
  storeId?: string;
  seoHomePageTitle?: string;
  seoMetaDescription?: string;
  seoSocialImageUrl?: string;
};

export type StorefrontSeoProduct = {
  _id: string;
  title: string;
  description?: string;
  pageTitle?: string;
  metaDescription?: string;
  imageUrls?: string[];
  price?: number;
  urlHandle?: string;
};

export type StorefrontSeoCollection = {
  title: string;
  description?: string;
  pageTitle?: string;
  metaDescription?: string;
  urlHandle?: string;
  imageUrl?: string;
};

export type StorefrontSeoBlog = {
  title: string;
  pageTitle?: string;
  metaDescription?: string;
  urlHandle?: string;
};

export type StorefrontSeoBlogPost = {
  title: string;
  excerpt?: string;
  content?: string;
  pageTitle?: string;
  metaDescription?: string;
  urlHandle?: string;
  featuredImageUrl?: string;
};
