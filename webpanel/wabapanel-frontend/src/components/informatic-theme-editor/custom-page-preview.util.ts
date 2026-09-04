export type CustomPagePreviewSelection = {
  urlHandle: string;
  title?: string;
};

export function isCustomPageTemplatePreviewPage(pageId: string): boolean {
  return pageId === 'page';
}

export function buildStorefrontCustomPageUrl(
  origin: string | null | undefined,
  urlHandle: string,
  preview = true
): string | null {
  const handle = urlHandle?.trim();
  if (!origin || !handle) return null;
  const base = origin.replace(/\/$/, '');
  const path = `/${encodeURIComponent(handle)}`;
  return preview ? `${base}${path}?preview=1` : `${base}${path}`;
}

export function pickDefaultCustomPagePreview(
  pages: Array<{ urlHandle: string; title: string; visibility?: string }>
): CustomPagePreviewSelection | null {
  const visible = pages.filter((p) => p.visibility !== 'hidden' && p.urlHandle?.trim());
  const pick = visible[0] || pages.find((p) => p.urlHandle?.trim());
  if (!pick) return null;
  return { urlHandle: pick.urlHandle.trim(), title: pick.title };
}
