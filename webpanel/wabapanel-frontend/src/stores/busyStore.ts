import { create } from 'zustand';

type BusyState = {
  count: number;
  label: string;
  pendingHref: string | null;
  /** True while a client navigation loader is waiting for the page to be ready. */
  navPending: boolean;
  show: (label?: string) => void;
  hide: () => void;
  reset: () => void;
};

let safetyTimer: ReturnType<typeof setTimeout> | null = null;
let arriveTimer: ReturnType<typeof setInterval> | null = null;
let finishTimer: ReturnType<typeof setTimeout> | null = null;

let navStartedAt = 0;
let urlArrived = false;
let pageReady = false;
let expectsPageTransition = false;

function clearNavWatchers() {
  if (safetyTimer) {
    clearTimeout(safetyTimer);
    safetyTimer = null;
  }
  if (arriveTimer) {
    clearInterval(arriveTimer);
    arriveTimer = null;
  }
  if (finishTimer) {
    clearTimeout(finishTimer);
    finishTimer = null;
  }
}

function normalizeClientHref(href: string): { path: string; search: string; full: string } | null {
  try {
    const url = new URL(href, typeof window !== 'undefined' ? window.location.origin : 'http://local');
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const search = url.search || '';
    return { path, search, full: `${path}${search}` };
  } catch {
    return null;
  }
}

export function getCurrentClientHref(): string {
  if (typeof window === 'undefined') return '';
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return `${path}${window.location.search || ''}`;
}

export function isSameClientHref(href: string): boolean {
  if (typeof window === 'undefined') return false;
  const next = normalizeClientHref(href);
  if (!next) return false;
  const curPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const curSearch = window.location.search || '';
  return next.path === curPath && next.search === curSearch;
}

/** Dashboard-wide busy veil — keep ActionBusyOverlay mounted in client layout. */
export const useBusyStore = create<BusyState>((set) => ({
  count: 0,
  label: 'Please wait',
  pendingHref: null,
  navPending: false,
  show: (label) =>
    set((s) => ({
      count: s.count > 0 ? s.count : 1,
      label: (label && label.trim()) || s.label || 'Please wait',
    })),
  hide: () => set((s) => ({ count: Math.max(0, s.count - 1), pendingHref: null, navPending: false })),
  reset: () => {
    clearNavWatchers();
    urlArrived = false;
    pageReady = false;
    expectsPageTransition = false;
    navStartedAt = 0;
    set({ count: 0, label: 'Please wait', pendingHref: null, navPending: false });
  },
}));

export function showBusy(label?: string) {
  useBusyStore.getState().show(label);
}

export function hideBusy() {
  useBusyStore.getState().hide();
}

export function resetBusy() {
  useBusyStore.getState().reset();
}

function tryFinishNavBusy() {
  const state = useBusyStore.getState();
  if (!state.navPending || state.count <= 0) return;
  if (!urlArrived || !pageReady) return;

  const minVisible = 450;
  const wait = Math.max(0, minVisible - (Date.now() - navStartedAt));
  if (finishTimer) clearTimeout(finishTimer);
  finishTimer = setTimeout(() => {
    finishTimer = null;
    resetBusy();
  }, wait);
}

/**
 * Call when the destination URL is active (soft nav committed).
 * Loader stays until signalPageReady() — i.e. page UI is painted.
 */
export function signalUrlArrived() {
  if (!useBusyStore.getState().navPending) return;
  urlArrived = true;

  // Query-only navigations don't remount PageTransition — mark ready after paint.
  if (!expectsPageTransition) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.setTimeout(() => signalPageReady(), 320);
      });
    });
  }

  tryFinishNavBusy();
}

/**
 * Call when the new page has painted / transition finished.
 * Wired from PageTransition idle.
 */
export function signalPageReady() {
  if (!useBusyStore.getState().navPending) return;
  pageReady = true;
  tryFinishNavBusy();
}

/**
 * Show loader for client route changes only.
 * Same-page clicks → no loader.
 * Clears only after URL arrives AND page is ready (not merely on URL change).
 */
export function showNavBusy(href?: string, label = 'Loading…'): boolean {
  if (typeof window === 'undefined') return false;

  if (href && isSameClientHref(href)) {
    resetBusy();
    return false;
  }

  clearNavWatchers();
  urlArrived = false;
  pageReady = false;
  navStartedAt = Date.now();

  const normalized = href ? normalizeClientHref(href) : null;
  const curPath = window.location.pathname.replace(/\/+$/, '') || '/';
  expectsPageTransition = Boolean(normalized && normalized.path !== curPath);

  useBusyStore.setState({
    count: 1,
    label: label || 'Loading…',
    pendingHref: normalized?.full ?? null,
    navPending: true,
  });

  if (normalized) {
    arriveTimer = setInterval(() => {
      if (getCurrentClientHref() === normalized.full) {
        if (arriveTimer) {
          clearInterval(arriveTimer);
          arriveTimer = null;
        }
        signalUrlArrived();
      }
    }, 40);
  }

  // Never leave the veil forever if something stalls.
  safetyTimer = setTimeout(() => {
    resetBusy();
  }, 10000);

  return true;
}

/** Run async work under the dashboard loading overlay. */
export async function withBusy<T>(label: string, work: () => Promise<T>): Promise<T> {
  showBusy(label);
  const started = Date.now();
  try {
    return await work();
  } finally {
    const wait = Math.max(0, 450 - (Date.now() - started));
    if (wait) await new Promise((r) => window.setTimeout(r, wait));
    hideBusy();
  }
}
