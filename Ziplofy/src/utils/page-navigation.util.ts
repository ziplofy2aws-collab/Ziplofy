export type StorePageDetailsLocationState = {
  pageJustCreated?: boolean;
};

/** Survives route remounts when create + edit share one component. */
let pendingJustCreatedPageId: string | null = null;
let pendingSkipSkeletonPageId: string | null = null;

export function markPageJustCreated(pageId: string): void {
  pendingJustCreatedPageId = pageId;
  pendingSkipSkeletonPageId = pageId;
}

export function peekPageJustCreated(pageId: string | undefined): boolean {
  return Boolean(pageId && pendingJustCreatedPageId === pageId);
}

export function consumePageJustCreated(pageId: string | undefined): boolean {
  if (!peekPageJustCreated(pageId)) return false;
  pendingJustCreatedPageId = null;
  return true;
}

export function consumeSkipPageLoadSkeleton(pageId: string | undefined): boolean {
  if (!pageId || pendingSkipSkeletonPageId !== pageId) return false;
  pendingSkipSkeletonPageId = null;
  return true;
}

export function readPageJustCreated(state: unknown): boolean {
  if (!state || typeof state !== 'object') return false;
  return Boolean((state as StorePageDetailsLocationState).pageJustCreated);
}
