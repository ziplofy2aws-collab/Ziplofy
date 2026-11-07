import { create } from 'zustand';

type BusyState = {
  count: number;
  label: string;
  show: (label?: string) => void;
  hide: () => void;
  reset: () => void;
};

/** Dashboard-wide busy veil — keep ActionBusyOverlay mounted in client layout. */
export const useBusyStore = create<BusyState>((set, get) => ({
  count: 0,
  label: 'Please wait',
  show: (label) =>
    set((s) => ({
      count: s.count + 1,
      label: (label && label.trim()) || s.label || 'Please wait',
    })),
  hide: () => set((s) => ({ count: Math.max(0, s.count - 1) })),
  reset: () => set({ count: 0, label: 'Please wait' }),
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
