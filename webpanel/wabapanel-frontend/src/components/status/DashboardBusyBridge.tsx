'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import ActionBusyOverlay from './ActionBusyOverlay';
import { resetBusy, showBusy } from '@/stores/busyStore';

/**
 * Always-mounted overlay. Shows loading.lottie on client route changes
 * (including mobile sidebar / search) and whenever busyStore is raised.
 */
export default function DashboardBusyBridge() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      resetBusy();
    }
  }, [pathname]);

  useEffect(() => {
    const maybeShowForHref = (rawHref: string | null) => {
      if (!rawHref) return;
      let href = rawHref.trim();
      if (!href.startsWith('/client')) return;
      if (href.startsWith('#')) return;

      try {
        const url = new URL(href, window.location.origin);
        href = `${url.pathname}${url.search}`;
      } catch {
        return;
      }

      const current = `${window.location.pathname}${window.location.search}`;
      if (href === current) return;

      showBusy('Loading…');

      // Same path, different query (e.g. chat channel) — pathname effect won't clear.
      if (href.split('?')[0] === window.location.pathname) {
        window.setTimeout(() => resetBusy(), 750);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.dataset.noBusy === '1') return;
      if (anchor.hasAttribute('download') || anchor.target === '_blank') return;
      maybeShowForHref(anchor.getAttribute('href'));
    };

    // pointerdown is reliable on phones; avoid also binding click (double count).
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, []);

  return <ActionBusyOverlay />;
}
