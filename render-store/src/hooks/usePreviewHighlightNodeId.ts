import { useEffect, useState } from 'react';
import { isParentPreviewMessage } from '@/theme-preview/previewBridge';

/** Sidebar-driven highlight node id (e.g. `layout:announcement_bar:block:announcement_2`). */
export function usePreviewHighlightNodeId(): string | null {
  const [nodeId, setNodeId] = useState<string | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isParentPreviewMessage(event.data)) return;
      if (event.data.type !== 'ZIPLOFY_PREVIEW_HIGHLIGHT') return;
      setNodeId(event.data.payload.nodeId ?? null);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return nodeId;
}

/** Parse `layout:{sectionId}:block:{blockId}` from a highlight node id. */
export function layoutBlockIdFromHighlightNodeId(
  highlightNodeId: string | null,
  sectionId: string
): string | null {
  if (!highlightNodeId) return null;
  const prefix = `layout:${sectionId}:block:`;
  if (!highlightNodeId.startsWith(prefix)) return null;
  return highlightNodeId.slice(prefix.length) || null;
}
