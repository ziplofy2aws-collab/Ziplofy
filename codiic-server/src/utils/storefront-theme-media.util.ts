/**
 * Editor-only media URLs (Vite static mounts) that 404 on merchant storefront hosts.
 * Clear them from storefront themeConfig so Header / favicon don't request missing assets.
 */
function isEditorOnlyMediaUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return (
    trimmed.startsWith('/remote-themes/') ||
    trimmed.startsWith('/static-editor-theme/')
  );
}

function clearEditorOnlyUrlField(obj: Record<string, unknown>, key: string): void {
  if (isEditorOnlyMediaUrl(obj[key])) {
    obj[key] = '';
  }
}

export function sanitizeStorefrontThemeMediaUrls(
  config: Record<string, unknown>
): Record<string, unknown> {
  const settings = config.settings;
  if (settings && typeof settings === 'object') {
    const logo = (settings as Record<string, unknown>).logo;
    if (logo && typeof logo === 'object') {
      const logoObj = logo as Record<string, unknown>;
      clearEditorOnlyUrlField(logoObj, 'defaultUrl');
      clearEditorOnlyUrlField(logoObj, 'inverseUrl');
      clearEditorOnlyUrlField(logoObj, 'faviconUrl');
    }
  }

  const sections = config.sections;
  if (sections && typeof sections === 'object') {
    const header = (sections as Record<string, unknown>).header;
    if (header && typeof header === 'object') {
      const headerObj = header as Record<string, unknown>;
      const headerSettings = headerObj.settings;
      if (headerSettings && typeof headerSettings === 'object') {
        clearEditorOnlyUrlField(headerSettings as Record<string, unknown>, 'defaultLogoUrl');
      }
      const blocks = headerObj.blocks;
      if (blocks && typeof blocks === 'object') {
        const logoBlock = (blocks as Record<string, unknown>).logo;
        if (logoBlock && typeof logoBlock === 'object') {
          const blockSettings = (logoBlock as Record<string, unknown>).settings;
          if (blockSettings && typeof blockSettings === 'object') {
            clearEditorOnlyUrlField(blockSettings as Record<string, unknown>, 'imageUrl');
          }
        }
      }
    }
  }

  return config;
}
