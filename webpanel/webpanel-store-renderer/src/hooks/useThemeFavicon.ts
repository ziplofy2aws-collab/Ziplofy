import { useEffect } from 'react';

/** Apply favicon from Informatic theme config (`settings.logo.faviconUrl`). */
export function useThemeFavicon(faviconUrl: string | null | undefined) {
  const url = String(faviconUrl || '').trim();

  useEffect(() => {
    const existing = document.querySelector<HTMLLinkElement>('link[data-informatic-favicon="1"]');
    if (!url) {
      existing?.remove();
      return;
    }
    const link = existing || document.createElement('link');
    link.setAttribute('data-informatic-favicon', '1');
    link.rel = 'icon';
    link.href = url;
    if (!existing) document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [url]);
}
