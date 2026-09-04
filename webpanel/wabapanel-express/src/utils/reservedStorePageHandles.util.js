/** URL handles that cannot be used for custom store pages (Informatic fixed routes). */
const RESERVED_STORE_PAGE_HANDLES = new Set([
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

function isReservedStorePageHandle(raw) {
  const handle = String(raw || '')
    .trim()
    .toLowerCase();
  return RESERVED_STORE_PAGE_HANDLES.has(handle);
}

module.exports = {
  RESERVED_STORE_PAGE_HANDLES,
  isReservedStorePageHandle,
};
