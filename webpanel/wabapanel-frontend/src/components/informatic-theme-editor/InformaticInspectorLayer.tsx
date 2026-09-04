'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  findInformaticNodeElement,
  nodeIdFromElement,
} from './informatic-inspector';

type Rect = { top: number; left: number; width: number; height: number };

function measure(el: HTMLElement, root: HTMLElement): Rect {
  const er = el.getBoundingClientRect();
  const rr = root.getBoundingClientRect();
  return {
    top: er.top - rr.top,
    left: er.left - rr.left,
    width: er.width,
    height: er.height,
  };
}

/**
 * Catalog-style inspector overlay: hover outline + click-to-select editable nodes.
 */
export function InformaticInspectorLayer({
  enabled,
  selectedNodeId,
  onSelectNode,
}: {
  enabled: boolean;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string, label: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<{ rect: Rect; label: string } | null>(null);
  const [selectRect, setSelectRect] = useState<Rect | null>(null);

  const syncSelectedRect = useCallback(() => {
    const root = rootRef.current?.parentElement;
    if (!root || !selectedNodeId) {
      setSelectRect(null);
      return;
    }
    const el = root.querySelector(
      `[data-informatic-node="${CSS.escape(selectedNodeId)}"]`
    ) as HTMLElement | null;
    if (!el) {
      setSelectRect(null);
      return;
    }
    setSelectRect(measure(el, root));
  }, [selectedNodeId]);

  useEffect(() => {
    syncSelectedRect();
  }, [syncSelectedRect, enabled]);

  useEffect(() => {
    if (!enabled) {
      setHover(null);
      setSelectRect(null);
      return;
    }
    const root = rootRef.current?.parentElement;
    if (!root) return;

    const scrollParent =
      (root.closest('.overflow-y-auto') as HTMLElement | null) ||
      (root.parentElement as HTMLElement | null);

    const onScrollOrResize = () => {
      syncSelectedRect();
      setHover(null);
    };
    scrollParent?.addEventListener('scroll', onScrollOrResize, { passive: true });
    root.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      scrollParent?.removeEventListener('scroll', onScrollOrResize);
      root.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [enabled, syncSelectedRect]);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current?.parentElement;
    if (!root) return;

    const onMove = (event: PointerEvent) => {
      const el = findInformaticNodeElement(root, event.target);
      if (!el) {
        setHover(null);
        return;
      }
      const nodeId = nodeIdFromElement(el);
      if (!nodeId) {
        setHover(null);
        return;
      }
      const label = el.getAttribute('data-informatic-label') || nodeId;
      setHover({ rect: measure(el, root), label });
    };

    const onLeave = () => setHover(null);

    const onClick = (event: MouseEvent) => {
      const el = findInformaticNodeElement(root, event.target);
      if (!el) return;
      const nodeId = nodeIdFromElement(el);
      if (!nodeId) return;
      event.preventDefault();
      event.stopPropagation();
      const label = el.getAttribute('data-informatic-label') || nodeId;
      onSelectNode(nodeId, label);
      setSelectRect(measure(el, root));
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('click', onClick, true);
    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('click', onClick, true);
    };
  }, [enabled, onSelectNode]);

  if (!enabled) {
    return <div ref={rootRef} className="pointer-events-none absolute inset-0" aria-hidden />;
  }

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      {hover ? (
        <>
          <div
            className="absolute rounded-md border-2 border-[#005bd3]/70 bg-[#005bd3]/08 transition-[top,left,width,height] duration-75"
            style={{
              top: hover.rect.top,
              left: hover.rect.left,
              width: hover.rect.width,
              height: hover.rect.height,
            }}
          />
          <div
            className="absolute z-10 max-w-[220px] truncate rounded bg-[#005bd3] px-2 py-0.5 text-[11px] font-semibold text-white shadow"
            style={{
              top: Math.max(0, hover.rect.top - 22),
              left: hover.rect.left,
            }}
          >
            {hover.label}
          </div>
        </>
      ) : null}
      {selectRect ? (
        <div
          className="absolute rounded-md border-2 border-[#005bd3] shadow-[0_0_0_1px_rgba(0,91,211,0.25)] transition-[top,left,width,height] duration-150"
          style={{
            top: selectRect.top,
            left: selectRect.left,
            width: selectRect.width,
            height: selectRect.height,
          }}
        />
      ) : null}
    </div>
  );
}
