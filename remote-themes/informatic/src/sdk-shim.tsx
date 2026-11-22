/**
 * Value-injection providers consumed by the host runtime's route loaders.
 * The host (editor preview / storefront renderer) wraps the matching page in
 * these providers and supplies fetched data; pages read it via the hooks.
 */
import { createContext, useContext, type ReactNode } from 'react';

export type InformaticBlogListPostData = {
  _id?: string;
  title: string;
  excerpt?: string;
  urlHandle?: string;
  featuredImageUrl?: string;
  publishedAt?: string;
  author?: string;
  blogTitle?: string;
  [key: string]: unknown;
};

export type InformaticBlogPostData = {
  _id?: string;
  title: string;
  content?: string;
  excerpt?: string;
  urlHandle?: string;
  featuredImageUrl?: string;
  author?: string;
  publishedAt?: string;
  blog?: { title: string; urlHandle?: string } | null;
  [key: string]: unknown;
};

export type InformaticCustomPageData = {
  title?: string;
  urlHandle?: string;
  content?: string;
  sections?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type InformaticStorePolicyData = {
  policyType?: string;
  title?: string;
  content?: string;
  [key: string]: unknown;
};

export type InformaticStorePolicyApiType = string;

type AnyValue = Record<string, unknown>;

function makeValueProvider() {
  const Ctx = createContext<AnyValue>({});
  const Provider = ({ value, children }: { value: AnyValue; children: ReactNode }) => (
    <Ctx.Provider value={value}>{children}</Ctx.Provider>
  );
  const useValue = () => useContext(Ctx);
  return { Provider, useValue };
}

const blogList = makeValueProvider();
export const InformaticBlogListProvider = blogList.Provider;
export const useInformaticBlogList = blogList.useValue;

const blogPost = makeValueProvider();
export const InformaticBlogPostProvider = blogPost.Provider;
export const useInformaticBlogPost = blogPost.useValue;

const customPage = makeValueProvider();
export const InformaticCustomPageProvider = customPage.Provider;
export const useInformaticCustomPage = customPage.useValue;

const storePolicy = makeValueProvider();
export const InformaticStorePolicyProvider = storePolicy.Provider;
export const useInformaticStorePolicy = storePolicy.useValue;
