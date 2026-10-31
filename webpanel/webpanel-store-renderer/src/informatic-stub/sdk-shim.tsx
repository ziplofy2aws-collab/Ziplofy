import { createContext, useContext, type ReactNode } from 'react';

/**
 * Informatic sdk-shim stub — value-injection providers used by the renderer's
 * route loader components. The real package lives in `remote-themes/informatic`
 * (gitignored build artifact).
 */

export type InformaticBlogListPostData = {
  _id?: string;
  title: string;
  excerpt?: string;
  urlHandle?: string;
  featuredImageUrl?: string;
  publishedAt?: string;
  [key: string]: unknown;
};

export type InformaticBlogPostData = {
  _id?: string;
  title: string;
  content?: string;
  urlHandle?: string;
  featuredImageUrl?: string;
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

/** Store policy identifiers used by the policy route loader. */
export type InformaticStorePolicyApiType = string;
