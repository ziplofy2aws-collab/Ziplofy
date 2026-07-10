import { joinTitle, META_DESCRIPTION_MAX, PAGE_TITLE_MAX, plainTextFromHtml, truncateSeoText } from './seo-text.util';
import type { StorefrontSeoPreviewInput } from './seo.types';

export function resolveStorefrontHomeSeoPreview(input: StorefrontSeoPreviewInput) {
  const storeName = input.storeName.trim() || 'Store';
  const title = joinTitle([
    input.seoHomePageTitle?.trim() || storeName,
    storeName !== (input.seoHomePageTitle?.trim() || '') ? storeName : undefined,
  ]);
  const description =
    input.seoMetaDescription?.trim() ||
    truncateSeoText(plainTextFromHtml(input.storeDescription ?? '')) ||
    `Shop online at ${storeName}.`;
  const origin = (input.storefrontOrigin ?? '').replace(/\/+$/, '');
  const canonicalUrl = origin ? `${origin}/` : '/';

  return {
    title,
    description,
    canonicalUrl,
    ogImage: input.seoSocialImageUrl?.trim() || undefined,
  };
}

export { PAGE_TITLE_MAX, META_DESCRIPTION_MAX };
