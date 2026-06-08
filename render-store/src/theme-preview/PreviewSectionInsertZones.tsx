import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ThemePreviewSelectionHint } from './previewBridge';
import { findElementForNodeId } from './previewSelectionAnnotate';
import { rafThrottle } from './previewPerf';

const SHOPIFY_BLUE = '#005bd3';

export type SectionInsertGap = {
  afterNodeId: string;
  top: number;
  left: number;
  width: number;
};

export type SectionInsertHighlight = {
  afterNodeId?: string;
  beforeNodeId?: string;
};

function fullWidthGap(gap: Omit<SectionInsertGap, 'left' | 'width'>): SectionInsertGap {
  const width = typeof window !== 'undefined' ? window.innerWidth : 800;
  return { ...gap, left: 0, width };
}

function isInsertableNodeId(nodeId: string | undefined): nodeId is string {
  return Boolean(nodeId && !nodeId.includes('add-section'));
}

function collectSectionElements(
  hints: ThemePreviewSelectionHint[]
): Array<{ nodeId: string; el: HTMLElement; rect: DOMRect }> {
  const items: Array<{ nodeId: string; el: HTMLElement; rect: DOMRect }> = [];

  for (const hint of hints) {
    if (hint.kind !== 'section') continue;
    const el = findElementForNodeId(hint.nodeId);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (rect.height < 2) continue;
    items.push({ nodeId: hint.nodeId, el, rect });
  }

  items.sort((a, b) => a.rect.top - b.rect.top);
  return items;
}

function gapBetween(
  above: { nodeId: string; rect: DOMRect },
  below: { nodeId: string; rect: DOMRect }
): SectionInsertGap | null {
  const gapTop = above.rect.bottom;
  const gapBottom = below.rect.top;
  if (gapBottom - gapTop < -40) return null;

  const top = gapBottom > gapTop ? (gapTop + gapBottom) / 2 - 8 : below.rect.top - 8;
  return fullWidthGap({
    afterNodeId: above.nodeId,
    top,
  });
}

export function collectSectionInsertGaps(hints: ThemePreviewSelectionHint[]): SectionInsertGap[] {
  const items = collectSectionElements(hints);
  const gaps: SectionInsertGap[] = [];

  for (let i = 0; i < items.length - 1; i += 1) {
    const gap = gapBetween(items[i], items[i + 1]);
    if (gap) gaps.push(gap);
  }

  return gaps;
}

/** Resolve the preview gap for a sidebar insert hover (after/before node ids). */
export function measureInsertGapForHighlight(
  highlight: SectionInsertHighlight,
  hints: ThemePreviewSelectionHint[]
): SectionInsertGap | null {
  const afterId = isInsertableNodeId(highlight.afterNodeId) ? highlight.afterNodeId : undefined;
  const beforeId = isInsertableNodeId(highlight.beforeNodeId) ? highlight.beforeNodeId : undefined;

  if (afterId) {
    const fromList = collectSectionInsertGaps(hints).find((g) => g.afterNodeId === afterId);
    if (fromList) return fromList;
  }

  const items = collectSectionElements(hints);
  if (!items.length) return null;

  if (afterId) {
    const idx = items.findIndex((item) => item.nodeId === afterId);
    if (idx >= 0 && idx < items.length - 1) {
      return gapBetween(items[idx], items[idx + 1]);
    }
    if (idx === items.length - 1) {
      const last = items[idx];
      return fullWidthGap({
        afterNodeId: afterId,
        top: last.rect.bottom + 8,
      });
    }
  }

  if (beforeId) {
    const idx = items.findIndex((item) => item.nodeId === beforeId);
    if (idx > 0) {
      return gapBetween(items[idx - 1], items[idx]);
    }
    if (idx === 0) {
      const first = items[0];
      return fullWidthGap({
        afterNodeId: beforeId,
        top: Math.max(8, first.rect.top - 8),
      });
    }
  }

  const aboveEl = afterId ? findElementForNodeId(afterId) : null;
  const belowEl = beforeId ? findElementForNodeId(beforeId) : null;
  if (aboveEl && belowEl) {
    const a = aboveEl.getBoundingClientRect();
    const b = belowEl.getBoundingClientRect();
    return fullWidthGap({
      afterNodeId: afterId ?? beforeId ?? '',
      top: (a.bottom + b.top) / 2 - 8,
    });
  }

  return null;
}

type PreviewSectionInsertZonesProps = {
  hints: ThemePreviewSelectionHint[];
  enabled?: boolean;
  /** Driven by sidebar insert-zone hover — always show this gap in the preview. */
  highlightedInsert?: SectionInsertHighlight | null;
  onInsert: (payload: SectionInsertHighlight) => void;
};

export function PreviewSectionInsertZones({
  hints,
  enabled = true,
  highlightedInsert = null,
  onInsert,
}: PreviewSectionInsertZonesProps) {
  const [gaps, setGaps] = useState<SectionInsertGap[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [highlightGap, setHighlightGap] = useState<SectionInsertGap | null>(null);

  const refreshGaps = useCallback(() => {
    setGaps(collectSectionInsertGaps(hints));
    if (highlightedInsert) {
      setHighlightGap(measureInsertGapForHighlight(highlightedInsert, hints));
    }
  }, [hints, highlightedInsert]);

  useEffect(() => {
    if (!enabled) {
      setGaps([]);
      setHighlightGap(null);
      return;
    }
    const timer = window.setTimeout(refreshGaps, 120);
    return () => window.clearTimeout(timer);
  }, [enabled, refreshGaps]);

  useEffect(() => {
    if (!enabled || !highlightedInsert) {
      setHighlightGap(null);
      return;
    }
    setHighlightGap(measureInsertGapForHighlight(highlightedInsert, hints));
  }, [enabled, highlightedInsert, hints]);

  useEffect(() => {
    if (!enabled) return;
    const onScrollOrResize = rafThrottle(() => refreshGaps());
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [enabled, refreshGaps]);

  const displayGaps = useMemo(() => {
    if (highlightGap) return [highlightGap];
    return gaps;
  }, [highlightGap, gaps]);

  if (!enabled || displayGaps.length === 0) return null;

  const forcedActive = Boolean(highlightGap);

  return (
    <>
      {displayGaps.map((gap) => {
        const key = `${gap.afterNodeId}:${gap.top}`;
        const active = forcedActive || activeKey === gap.afterNodeId;
        return (
          <div
            key={key}
            className="ziplofy-section-insert-zone"
            style={{ top: gap.top }}
            onMouseEnter={() => setActiveKey(gap.afterNodeId)}
            onMouseLeave={() => setActiveKey((k) => (k === gap.afterNodeId ? null : k))}
          >
            <div
              className={`ziplofy-section-insert-line ${active ? 'is-active' : ''}`}
              aria-hidden={!active}
            >
              <div className="ziplofy-section-insert-rule" />
              <button
                type="button"
                className="ziplofy-section-insert-btn"
                aria-label="Add section"
                tabIndex={active ? 0 : -1}
                style={{ backgroundColor: SHOPIFY_BLUE }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onInsert({
                    afterNodeId: gap.afterNodeId,
                    beforeNodeId: highlightedInsert?.beforeNodeId,
                  });
                }}
              >
                <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-3.5 w-3.5">
                  <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <div className="ziplofy-section-insert-rule" />
            </div>
          </div>
        );
      })}
    </>
  );
}
