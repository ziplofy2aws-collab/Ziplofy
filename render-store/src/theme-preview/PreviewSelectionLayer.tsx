import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  isParentPreviewMessage,
  postToParent,
  type ThemePreviewInsertHighlightPayload,
  type ThemePreviewSelectionHint,
} from './previewBridge';
import {
  annotatePreviewSelectionHints,
  findEditableTargetFromPoint,
  findElementForNodeId,
  resolveSelectionFromElement,
  scrollPreviewToNodeId,
} from './previewSelectionAnnotate';
import {
  canInlineEdit,
  fieldPathFromNodeId,
  hintForNodeId,
  startInlineEdit,
  stopInlineEdit,
} from './previewInlineEdit';
import { hintsMatchKey, hintsStructureKey, rafThrottle } from './previewPerf';
import { PreviewSectionInsertZones } from './PreviewSectionInsertZones';
import './previewSelection.css';

type Rect = { top: number; left: number; width: number; height: number };

type PreviewSelectionLayerProps = {
  hints: ThemePreviewSelectionHint[];
  insertHighlight?: ThemePreviewInsertHighlightPayload;
  enabled?: boolean;
};

function measureRect(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function DragHandleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M7 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm9 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM7 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm9 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
    </svg>
  );
}

function EyeSlashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" d="M3 3l18 18M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-3.42M9.88 5.1A10.94 10.94 0 0 1 12 5c5.5 0 9.5 4.5 10.5 7-0.4 1-1.2 2.4-2.3 3.8M6.1 6.1C4.2 7.4 2.8 9.2 2 12c1 2.5 5 7 10 7 1.1 0 2.1-.2 3.1-.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5h6v2m-7 4v7h8v-7" />
    </svg>
  );
}

export function PreviewSelectionLayer({
  hints,
  insertHighlight = null,
  enabled = true,
}: PreviewSelectionLayerProps) {
  const hintsRef = useRef(hints);
  hintsRef.current = hints;

  const [hoverRect, setHoverRect] = useState<Rect | null>(null);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const [selected, setSelected] = useState<{
    el: HTMLElement;
    nodeId: string;
    label: string;
    kind: string;
  } | null>(null);
  const [selectRect, setSelectRect] = useState<Rect | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const selectedRef = useRef(selected);
  const isEditingRef = useRef(false);
  const editOriginalRef = useRef('');
  const editElRef = useRef<HTMLElement | null>(null);
  const lastHoverNodeIdRef = useRef<string | null>(null);
  const hintsStructureRef = useRef('');
  const hintsMatchRef = useRef('');

  selectedRef.current = selected;
  isEditingRef.current = isEditing;

  const updateRects = useCallback(() => {
    const el = editElRef.current ?? selectedRef.current?.el;
    if (el?.isConnected) {
      setSelectRect(measureRect(el));
    }
  }, []);

  const commitInlineEdit = useCallback(() => {
    const el = editElRef.current;
    const sel = selectedRef.current;
    if (!el || !sel || !isEditingRef.current) return;

    const fieldPath = fieldPathFromNodeId(sel.nodeId);
    stopInlineEdit(el);
    editElRef.current = null;
    setIsEditing(false);

    if (!fieldPath) return;

    const value = (el.innerText ?? '').replace(/\s+/g, ' ').trim();
    postToParent({
      source: 'ziplofy-theme-preview',
      type: 'ZIPLOFY_PREVIEW_FIELD_CHANGE',
      payload: { nodeId: sel.nodeId, fieldPath, value },
    });
  }, []);

  const cancelInlineEdit = useCallback(() => {
    const el = editElRef.current;
    if (!el) return;
    el.textContent = editOriginalRef.current;
    stopInlineEdit(el);
    editElRef.current = null;
    setIsEditing(false);
  }, []);

  const beginInlineEdit = useCallback(
    (el: HTMLElement, nodeId: string) => {
      if (!canInlineEdit(nodeId, hintsRef.current)) return;
      const hint = hintForNodeId(nodeId, hintsRef.current);
      editOriginalRef.current = startInlineEdit(el, hint);
      editElRef.current = el;
      setIsEditing(true);

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          cancelInlineEdit();
          el.removeEventListener('keydown', onKeyDown);
          return;
        }
        if (e.key === 'Enter' && hint?.fieldType !== 'textarea') {
          e.preventDefault();
          commitInlineEdit();
          el.removeEventListener('keydown', onKeyDown);
        }
      };

      const onBlur = () => {
        window.setTimeout(() => {
          if (isEditingRef.current && editElRef.current === el) {
            commitInlineEdit();
          }
        }, 0);
        el.removeEventListener('keydown', onKeyDown);
        el.removeEventListener('blur', onBlur);
      };

      el.addEventListener('keydown', onKeyDown);
      el.addEventListener('blur', onBlur);
    },
    [cancelInlineEdit, commitInlineEdit]
  );

  const clearPreviewSelection = useCallback(
    (opts?: { commitEdit?: boolean }) => {
      if (isEditingRef.current) {
        if (opts?.commitEdit !== false) commitInlineEdit();
        else cancelInlineEdit();
      }
      setSelected(null);
      setSelectRect(null);
      setHoverRect(null);
      setHoverLabel(null);
      lastHoverNodeIdRef.current = null;
    },
    [cancelInlineEdit, commitInlineEdit]
  );

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add('ziplofy-preview-edit-mode');
    return () => document.documentElement.classList.remove('ziplofy-preview-edit-mode');
  }, [enabled]);

  useEffect(() => {
    if (enabled) return;
    clearPreviewSelection({ commitEdit: false });
    postToParent({ source: 'ziplofy-theme-preview', type: 'ZIPLOFY_PREVIEW_DESELECT' });
  }, [enabled, clearPreviewSelection]);

  useEffect(() => {
    if (!enabled || isEditingRef.current) return;
    const structureKey = hintsStructureKey(hints);
    const matchKey = hintsMatchKey(hints);
    const structureChanged = structureKey !== hintsStructureRef.current;

    if (structureChanged) {
      hintsStructureRef.current = structureKey;
      hintsMatchRef.current = matchKey;
      const timer = window.setTimeout(() => {
        annotatePreviewSelectionHints(hintsRef.current, { incremental: false });
      }, 100);
      return () => window.clearTimeout(timer);
    }

    if (matchKey === hintsMatchRef.current) return;
    hintsMatchRef.current = matchKey;
    const timer = window.setTimeout(() => {
      annotatePreviewSelectionHints(hintsRef.current, { incremental: true });
    }, 280);
    return () => window.clearTimeout(timer);
  }, [hints, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const onMessage = (event: MessageEvent) => {
      if (!isParentPreviewMessage(event.data)) return;
      if (event.data.type !== 'ZIPLOFY_PREVIEW_HIGHLIGHT') return;
      const nodeId = event.data.payload.nodeId;
      if (!nodeId) {
        clearPreviewSelection({ commitEdit: true });
        return;
      }

      const applyHighlight = () => {
        const el = findElementForNodeId(nodeId);
        if (!el) return false;
        const markedId = el.getAttribute('data-ziplofy-node');
        const hintMeta = hintForNodeId(nodeId, hintsRef.current);
        const resolved =
          markedId === nodeId
            ? {
                nodeId,
                label: el.getAttribute('data-ziplofy-label') ?? hintMeta?.label ?? 'Section',
                kind:
                  (el.getAttribute('data-ziplofy-kind') as ThemePreviewSelectionHint['kind']) ??
                  hintMeta?.kind ??
                  'section',
              }
            : hintMeta
              ? {
                  nodeId,
                  label: hintMeta.label,
                  kind: hintMeta.kind,
                }
              : resolveSelectionFromElement(el, hintsRef.current) ?? {
                  nodeId,
                  label: el.getAttribute('data-ziplofy-label') ?? 'Section',
                  kind:
                    (el.getAttribute('data-ziplofy-kind') as ThemePreviewSelectionHint['kind']) ??
                    'section',
                };
        setSelected({ el, ...resolved });
        setSelectRect(measureRect(el));
        scrollPreviewToNodeId(nodeId);
        return true;
      };

      if (!applyHighlight()) {
        window.setTimeout(() => {
          annotatePreviewSelectionHints(hintsRef.current, { incremental: true });
          applyHighlight();
        }, 80);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [enabled, clearPreviewSelection]);

  useEffect(() => {
    if (!enabled) return;
    const onScrollOrResize = rafThrottle(() => updateRects());
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [enabled, updateRects]);

  useEffect(() => {
    if (!enabled) return;

    const onMove = rafThrottle((e: MouseEvent) => {
      if (isEditingRef.current) return;

      const target = findEditableTargetFromPoint(e.clientX, e.clientY);
      if (!target) {
        if (lastHoverNodeIdRef.current !== null) {
          lastHoverNodeIdRef.current = null;
          setHoverRect(null);
          setHoverLabel(null);
        }
        return;
      }

      const resolved = resolveSelectionFromElement(target, hintsRef.current);
      const nodeId = resolved?.nodeId ?? target.getAttribute('data-ziplofy-node');
      if (nodeId && nodeId === selectedRef.current?.nodeId) {
        if (lastHoverNodeIdRef.current !== null) {
          lastHoverNodeIdRef.current = null;
          setHoverRect(null);
          setHoverLabel(null);
        }
        return;
      }
      if (nodeId && nodeId === lastHoverNodeIdRef.current) return;

      lastHoverNodeIdRef.current = nodeId;
      setHoverRect(measureRect(target));
      setHoverLabel(resolved?.label ?? target.getAttribute('data-ziplofy-label') ?? 'Section');
    });

    const onClick = (e: MouseEvent) => {
      const toolbar = (e.target as HTMLElement).closest('.ziplofy-selection-toolbar');
      if (toolbar) return;
      if ((e.target as HTMLElement).closest('[data-ziplofy-inline-editing]')) return;

      const target = findEditableTargetFromPoint(e.clientX, e.clientY);
      if (!target) {
        if (isEditingRef.current) commitInlineEdit();
        if (selectedRef.current) {
          clearPreviewSelection({ commitEdit: false });
          postToParent({ source: 'ziplofy-theme-preview', type: 'ZIPLOFY_PREVIEW_DESELECT' });
        }
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const resolved = resolveSelectionFromElement(target, hintsRef.current);
      if (!resolved) return;

      if (isEditingRef.current && selectedRef.current?.nodeId !== resolved.nodeId) {
        commitInlineEdit();
      }

      setSelected({ el: target, ...resolved });
      setSelectRect(measureRect(target));
      setHoverRect(null);
      setHoverLabel(null);
      lastHoverNodeIdRef.current = null;

      postToParent({
        source: 'ziplofy-theme-preview',
        type: 'ZIPLOFY_PREVIEW_SELECT',
        payload: resolved,
      });

      if (canInlineEdit(resolved.nodeId, hintsRef.current)) {
        requestAnimationFrame(() => beginInlineEdit(target, resolved.nodeId));
      }
    };

    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onClick, true);

    return () => {
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('click', onClick, true);
    };
  }, [enabled, beginInlineEdit, clearPreviewSelection, commitInlineEdit]);

  const postAction = (action: 'hide' | 'duplicate' | 'delete') => {
    if (!selected) return;
    if (isEditing) commitInlineEdit();
    postToParent({
      source: 'ziplofy-theme-preview',
      type: 'ZIPLOFY_PREVIEW_ACTION',
      payload: { action, nodeId: selected.nodeId },
    });
    if (action === 'hide' || action === 'delete') {
      clearPreviewSelection({ commitEdit: false });
      postToParent({ source: 'ziplofy-theme-preview', type: 'ZIPLOFY_PREVIEW_DESELECT' });
    }
  };

  if (!enabled || typeof document === 'undefined') return null;

  return createPortal(
    <div
      id="ziplofy-preview-selection-root"
      className={selected || isEditing ? 'ziplofy-selection-active' : undefined}
    >
      {hoverRect && !isEditing && (
        <div
          className="ziplofy-selection-box ziplofy-selection-box-hover"
          style={{
            top: hoverRect.top,
            left: hoverRect.left,
            width: hoverRect.width,
            height: hoverRect.height,
            opacity: 0.55,
          }}
        />
      )}

      {selectRect && selected && (
        <>
          <div
            className={`ziplofy-selection-box ${isEditing ? 'ziplofy-selection-box-editing' : ''}`}
            style={{
              top: selectRect.top,
              left: selectRect.left,
              width: selectRect.width,
              height: selectRect.height,
            }}
          />
          {!isEditing && (
            <>
              <div
                className="ziplofy-selection-label"
                style={{
                  top: Math.max(4, selectRect.top - 28),
                  left: selectRect.left,
                }}
              >
                <DragHandleIcon />
                {selected.label}
              </div>
              <div
                className="ziplofy-selection-toolbar"
                style={{
                  top: selectRect.top + selectRect.height + 8,
                  left: Math.max(8, Math.min(selectRect.left, window.innerWidth - 120)),
                }}
              >
                <button
                  type="button"
                  className="ziplofy-selection-toolbar-btn"
                  title="Hide"
                  onClick={() => postAction('hide')}
                >
                  <EyeSlashIcon />
                </button>
                <button
                  type="button"
                  className="ziplofy-selection-toolbar-btn danger"
                  title="Remove"
                  onClick={() => postAction('delete')}
                >
                  <TrashIcon />
                </button>
              </div>
            </>
          )}
          {isEditing && (
            <div
              className="ziplofy-selection-label ziplofy-selection-label-editing"
              style={{
                top: Math.max(4, selectRect.top - 28),
                left: selectRect.left,
              }}
            >
              Editing {selected.label}…
            </div>
          )}
        </>
      )}

      {hoverRect && hoverLabel && !isEditing && (
        <div
          className="ziplofy-selection-label"
          style={{
            top: Math.max(4, hoverRect.top - 28),
            left: hoverRect.left,
            opacity: 0.92,
          }}
        >
          {hoverLabel}
        </div>
      )}

      {!selected && !isEditing ? (
        <PreviewSectionInsertZones
          hints={hints}
          enabled={enabled}
          highlightedInsert={insertHighlight}
          onInsert={(payload) => {
            postToParent({
              source: 'ziplofy-theme-preview',
              type: 'ZIPLOFY_PREVIEW_INSERT_SECTION',
              payload,
            });
          }}
        />
      ) : null}
    </div>,
    document.body
  );
}
