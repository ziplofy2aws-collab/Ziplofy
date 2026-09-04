/** URL handles reserved by Informatic theme fixed routes — custom pages cannot use these. */
export const RESERVED_STORE_PAGE_HANDLES = new Set([
  'about',
  'features',
  'pricing',
  'blog',
  'blogs',
  'contact',
  'faq',
  'privacy',
  'terms',
  'search',
  '404',
  'pages',
  'return-refund',
  'contact-information',
]);

export function isReservedStorePageHandle(handle: string): boolean {
  return RESERVED_STORE_PAGE_HANDLES.has(handle.trim().toLowerCase());
}
