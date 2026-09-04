/** Public lead-gen form page path (web panel frontend). */
export function buildLeadGenFormPublicPath(formId: string): string {
  const id = String(formId || '').trim();
  return id ? `/form/${encodeURIComponent(id)}` : '/form';
}

/** Full public URL for sharing / menu links (uses current origin in browser). */
export function buildLeadGenFormPublicUrl(formId: string, origin?: string): string {
  const path = buildLeadGenFormPublicPath(formId);
  const base =
    origin?.replace(/\/$/, '') ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  return base ? `${base}${path}` : path;
}
