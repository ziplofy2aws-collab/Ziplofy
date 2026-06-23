import { useEffect } from 'react';

function googleFontStylesheetUrl(fontName: string): string {
  const family = encodeURIComponent(fontName).replace(/%20/g, '+');
  return `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
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
