export type StorefrontSeoPayload = {
  title: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'product' | 'collection';
  ogImage?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export type StorefrontSeoStore = {
  name: string;
  description?: string;
  storeId?: string;
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
