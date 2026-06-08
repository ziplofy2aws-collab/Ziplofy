/** Shared perf helpers for theme preview iframe. */

export function rafThrottle<T extends (...args: never[]) => void>(fn: T): T {
  let frame = 0;
  let pending: Parameters<T> | null = null;
  const run = () => {
    frame = 0;
    if (pending) {
      fn(...pending);
      pending = null;
    }
  };
  return ((...args: Parameters<T>) => {
    pending = args;
    if (!frame) frame = requestAnimationFrame(run);
  }) as T;
}

export function hintsStructureKey(hints: Array<{ nodeId: string }>): string {
  return hints
    .map((h) => h.nodeId)
    .sort()
    .join('|');
}

/** Changes when live match text changes (for lighter incremental re-annotate). */
export function hintsMatchKey(hints: Array<{ nodeId: string; matchText?: string }>): string {
  return hints
    .map((h) => `${h.nodeId}:${(h.matchText ?? '').slice(0, 96)}`)
    .sort()
    .join('|');
}

export function shallowJsonEqual(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}
