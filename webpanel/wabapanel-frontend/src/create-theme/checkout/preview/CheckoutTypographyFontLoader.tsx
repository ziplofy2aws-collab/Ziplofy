import { useEffect } from 'react';

function googleFontStylesheetUrl(fontName: string): string {
  const family = encodeURIComponent(fontName).replace(/%20/g, '+');
  // Legacy v1 API serves whatever of these weights the font supports (css2 would
  // 400 the whole request if any listed weight is missing).
  const weights = '100,300,400,500,600,700,900';
  return `https://fonts.googleapis.com/css?family=${family}:${weights}&display=swap`;
}

export function CheckoutTypographyFontLoader({
  fonts,
}: {
  fonts: Array<string | null | undefined>;
}) {
  const key = fonts.filter(Boolean).join('|');

  useEffect(() => {
    const unique = [...new Set(fonts.filter((font): font is string => Boolean(font)))];
    const links = unique.map((fontName) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = googleFontStylesheetUrl(fontName);
      document.head.appendChild(link);
      return link;
    });
    return () => {
      links.forEach((link) => link.remove());
    };
  }, [key]);

  return null;
}
