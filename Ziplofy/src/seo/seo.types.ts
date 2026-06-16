export type AdminSeoPayload = {
  title: string;
  description?: string;
  robots?: string;
};

export type SearchEngineListingValues = {
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
};

export type StoreSeoSettings = {
  seoHomePageTitle: string;
  seoMetaDescription: string;
  seoSocialImageUrl: string;
};

export type StorefrontSeoPreviewInput = {
  storeName: string;
  storeDescription?: string;
  seoHomePageTitle?: string;
  seoMetaDescription?: string;
  seoSocialImageUrl?: string;
  storefrontOrigin?: string;
};
