'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import ActionBusyOverlay from './ActionBusyOverlay';
import { isSameClientHref, resetBusy, showNavBusy, useBusyStore } from '@/stores/busyStore';

/**
 * Hosts the busy overlay.
 * Loader stays until the destination URL is active AND the page has painted
 * (PageTransition signals ready). Same-URL clicks never show a stuck veil.
 */
export default function DashboardBusyBridge() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // A route committed — a leaked non-nav busy (plain showBusy without hide)
  // must not veil the landed page forever.
  useEffect(() => {
    const s = useBusyStore.getState();
    if (s.count > 0 && !s.navPending) s.reset();
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // Next <Link> sets defaultPrevented — ignore that flag.
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.dataset.noBusy === '1') return;
      if (anchor.hasAttribute('download') || anchor.target === '_blank') return;

      const raw = (anchor.getAttribute('href') || '').trim();
      if (!raw.startsWith('/client') || raw.startsWith('#')) return;

      if (isSameClientHref(raw)) {
        resetBusy();
        return;
      }

      showNavBusy(raw);
    };

    document.addEventListener('click', onClick, false);
    return () => document.removeEventListener('click', onClick, false);
  }, []);

  return <ActionBusyOverlay />;
}
