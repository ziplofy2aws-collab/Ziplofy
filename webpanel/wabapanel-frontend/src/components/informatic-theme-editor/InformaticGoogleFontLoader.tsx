'use client';

import { useEffect } from 'react';

function googleFontStylesheetUrl(fontName: string): string {
  const family = encodeURIComponent(fontName).replace(/%20/g, '+');
  const weights = '100,300,400,500,600,700,900';
  return `https://fonts.googleapis.com/css?family=${family}:${weights}&display=swap`;
}

/** Load Google Fonts stylesheets for font picker previews. */
export function InformaticGoogleFontLoader({
  fonts,
}: {
  fonts: Array<string | null | undefined>;
}) {
  const key = fonts.filter(Boolean).join('|');

  useEffect(() => {
    const unique = [...new Set(fonts.filter((font): font is string => Boolean(font)))];
    const links = unique.map((fontName) => {
      const id = `informatic-font-preview-${fontName.toLowerCase().replace(/\s+/g, '-')}`;
      const existing = document.getElementById(id);
      if (existing) return existing as HTMLLinkElement;
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = googleFontStylesheetUrl(fontName);
      document.head.appendChild(link);
      return link;
    });
    return () => {
      for (const link of links) {
        if (link.parentNode) link.remove();
      }
    };
  }, [key]);

  return null;
}
