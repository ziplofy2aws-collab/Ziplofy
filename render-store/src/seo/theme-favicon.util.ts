const THEME_FAVICON_LINK_ID = 'codiic-theme-favicon';

function guessFaviconMimeType(url: string): string {
  const lower = url.split('?')[0]?.toLowerCase() ?? '';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.ico')) return 'image/x-icon';
  return 'image/png';
}

export function readThemeFaviconUrl(config: Record<string, unknown> | null | undefined): string {
  if (!config || typeof config !== 'object') return '';
  const settings = config.settings;
  if (!settings || typeof settings !== 'object') return '';
  const logo = (settings as Record<string, unknown>).logo;
  if (!logo || typeof logo !== 'object') return '';
  const faviconUrl = (logo as Record<string, unknown>).faviconUrl;
  const trimmed = typeof faviconUrl === 'string' ? faviconUrl.trim() : '';
  // Pack defaults / editor paths are not available on merchant storefront hosts.
  if (trimmed.startsWith('/remote-themes/') || trimmed.startsWith('/static-editor-theme/')) {
    return '';
  }
  return trimmed;
}

export function applyThemeFaviconToDocument(faviconUrl: string): void {
  const trimmed = faviconUrl.trim();

  if (!trimmed) {
    document.getElementById(THEME_FAVICON_LINK_ID)?.remove();
    return;
  }

  document
    .querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
    .forEach((el) => {
      if (el.id !== THEME_FAVICON_LINK_ID) el.remove();
    });

  let link = document.getElementById(THEME_FAVICON_LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = THEME_FAVICON_LINK_ID;
    link.rel = 'icon';
    document.head.prepend(link);
  }

  link.href = trimmed;
  link.type = guessFaviconMimeType(trimmed);
}
