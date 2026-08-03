import { META_DESCRIPTION_MAX, plainTextFromHtml, slugFromTitle } from '../seo/seo-text.util';

export type CollectionSeoOverrides = {
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
};

/** Derive SEO fields from title/description, keeping any non-empty overrides. */
export function resolveCollectionSeoFields(
  title: string,
  descriptionHtml: string,
  overrides: CollectionSeoOverrides
) {
  const trimmedTitle = title.trim();
  const plainDescription = plainTextFromHtml(descriptionHtml);
  const derivedMeta = (plainDescription || trimmedTitle).slice(0, META_DESCRIPTION_MAX);
  const metaDescription =
    overrides.metaDescription.trim() ||
    (derivedMeta.length >= 10
      ? derivedMeta
      : `${derivedMeta}${derivedMeta ? ' ' : ''}Collection page`.trim().slice(0, META_DESCRIPTION_MAX));

  return {
    pageTitle: overrides.pageTitle.trim() || trimmedTitle,
    metaDescription,
    urlHandle:
      overrides.urlHandle.trim() || slugFromTitle(trimmedTitle, 'collection') || `collection-${Date.now()}`,
  };
}

export function getCollectionApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as {
    response?: { data?: { message?: string; error?: string; details?: { message?: string } } };
    message?: string;
  };
  const apiMessage =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.response?.data?.details?.message;
  if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage.trim();
  if (typeof err?.message === 'string' && err.message.trim()) {
    const msg = err.message.trim();
    if (!/^request failed with status code \d+$/i.test(msg)) return msg;
  }
  return fallback;
}
