/**
 * Elementor Theme Builder – theme handling, selection, modification, and drag-drop.
 * Centralizes: canvas setup, drop target resolution, block append, style panel, block DnD.
 */

import { sanitizeBlockContentForAppend, isContentCssNotHtml } from './visualElementorThemeUtils';
import { runExpandAndConfigureSelectability, runExpandAndConfigureSelectabilityForComponent } from './visualElementorEditorSetup';

/** Find the nearest droppable component for a DOM element (used during block drag) */
export function findDroppableForElement(editor: any, el: Element | null): any {
  if (!el || !editor) return null;
  const doc = editor.Canvas?.getFrameEl?.()?.contentDocument;
  if (!doc) return null;
  const inDoc = doc.body?.contains?.(el);
  if (!inDoc) return null; // Element detached (e.g. after setComponents)

  let node: Node | null = el;
  while (node && node !== doc.body) {
    if (node.nodeType === 1) {
      const comp = editor.Components?.getComponent?.(node as Element) ?? (node as any).__gjsv?.model;
      if (comp) {
        let p: any = comp;
        while (p && p.get?.('type') !== 'wrapper') {
          if (p.get?.('droppable')) return p;
          try {
            p = typeof p.getParent === 'function' ? p.getParent() : null;
          } catch {
            break;
          }
        }
      }
    }
    node = node.parentNode;
  }
  return null;
}

/** Get best drop target: element under cursor, or first droppable child of wrapper */
export function getDropTarget(editor: any, cursorEl: Element | null): any {
  const wrapper = editor?.getWrapper?.();
  if (!wrapper) return null;
  const found = cursorEl ? findDroppableForElement(editor, cursorEl) : null;
  if (found) return found;
  const children = wrapper.components?.() || [];
  const droppable = children.find((c: any) => c?.get?.('droppable'));
  return droppable || wrapper;
}

/** Path from wrapper to component as array of child indices. Use before setComponents. */
export function getComponentPath(comp: any, wrapper: any): number[] {
  const path: number[] = [];
  if (!comp || !wrapper || comp === wrapper) return path;
  let c: any = comp;
  while (c && c !== wrapper) {
    const coll = c.collection;
    if (!coll) return path;
    const idx = coll.indexOf(c);
    if (idx < 0) return path;
    path.unshift(idx);
    try {
      c = typeof c.getParent === 'function' ? c.getParent() : (c as any).parent?.();
    } catch {
      return path;
    }
  }
  return path;
}

/** Get component at path from wrapper. Use after setComponents when structure matches. */
export function getComponentAtPath(wrapper: any, path: number[]): any {
  if (!wrapper || !Array.isArray(path) || path.length === 0) return wrapper;
  let comp: any = wrapper;
  const children = wrapper.components?.() || [];
  for (let i = 0; i < path.length; i++) {
    const idx = path[i];
    const ch = comp.components?.() || [];
    if (idx < 0 || idx >= ch.length) return comp;
    comp = ch[idx];
  }
  return comp;
}

/** Ensure wrapper and canvas accept drops – call before/at drag start */
export function ensureWrapperDroppable(editor: any): void {
  const wrapper = editor?.getWrapper?.();
  if (!wrapper) return;
  if (!wrapper.get('droppable')) wrapper.set('droppable', '*');
  const el = wrapper.getEl?.();
  if (el) {
    (el as HTMLElement).style.pointerEvents = 'auto';
    (el as HTMLElement).style.minHeight = '400px';
  }
  const frame = editor?.Canvas?.getFrameEl?.();
  const body = frame?.contentDocument?.body;
  if (body) (body as HTMLElement).style.pointerEvents = 'auto';
}

/** Configure and select a newly added component; ensure it's visible and stylable */
export function configureAndSelectAddedComponent(editor: any, comp: any): void {
  if (!comp) return;
  try {
    comp.set({ selectable: true, hoverable: true, draggable: true, stylable: true }, { silent: true });
    const el = comp.getEl?.();
    if (el) {
      (el as HTMLElement).style.display = '';
      (el as HTMLElement).style.visibility = 'visible';
      (el as HTMLElement).style.opacity = '1';
    }
    runExpandAndConfigureSelectabilityForComponent(editor, comp);
    editor.select(comp);
    editor.refresh?.();
  } catch {}
}

/** Ensure style panel is visible and targets the selected component */
export function ensureStylePanelForSelection(editor: any, stylePanelId = 'style-panel'): void {
  const panel = document.getElementById(stylePanelId);
  if (panel) {
    panel.style.display = 'block';
    panel.style.visibility = 'visible';
    panel.style.opacity = '1';
  }
  try {
    const sm = editor?.StyleManager;
    const sel = editor?.getSelected?.();
    if (sm && sel) (sm.setTarget || sm.select)?.call(sm, sel);
  } catch {}
}

/** Minimal drop zone when adding first block to empty canvas - no dashed border or placeholder */
export const DEFAULT_DROP_ZONE_HTML =
  '<section style="min-height: 200px; width: 100%;" data-gjs-droppable="*" data-gjs-selectable="true"></section>';

/** Index within parent where to insert (0 = first). Use -1 to append at end. */
export function getDropIndex(editor: any, cursorEl: Element | null, dropTarget: any): number {
  if (!cursorEl || !dropTarget || !editor) return -1;
  const comp = editor.Components?.getComponent?.(cursorEl as Element) ?? (cursorEl as any).__gjsv?.model;
  if (!comp) return -1;
  try {
    let c: any = comp;
    while (c && c !== dropTarget) {
      const parent = typeof c.getParent === 'function' ? c.getParent() : null;
      if (!parent) return -1;
      if (parent === dropTarget) {
        const coll = c.collection;
        if (!coll) return -1;
        const idx = coll.indexOf(c);
        return idx >= 0 ? idx : -1;
      }
      c = parent;
    }
    if (c === dropTarget) return 0; // cursor is on drop target itself
  } catch {}
  return -1;
}

/**
 * Append block content to a target component. Use when GrapesJS drop fails or replaces theme.
 * Pass at >= 0 to insert at specific index; otherwise appends at end.
 * Returns the added component or null.
 */
export function appendBlockToTarget(editor: any, block: any, target: any, at: number = -1): any {
  if (!editor || !block?.get || !target?.append) return null;
  let content = block.get('content');
  if (!content) return null;
  content = sanitizeBlockContentForAppend(content);
  if (!content || isContentCssNotHtml(content)) return null;
  try {
    const opts = at >= 0 ? { at } : undefined;
    const added = opts ? target.append(content, opts) : target.append(content);
    const comp = Array.isArray(added) ? added[0] : added;
    if (comp) {
      comp.set?.({ selectable: true, hoverable: true, draggable: true, stylable: true });
      runExpandAndConfigureSelectabilityForComponent(editor, comp);
      editor.select?.(comp);
      editor.refresh?.();
    }
    return comp;
  } catch {
    return null;
  }
}

/** Ensure blocks panel exists and blocks have cursor:grab for drag */
export function ensureBlocksPanelReady(editor: any, blocksPanelId = 'blocks-panel'): void {
  const panel = document.getElementById(blocksPanelId);
  const wrapper = document.querySelector('.elementor-blocks-wrapper') as HTMLElement;
  if (wrapper) {
    wrapper.style.setProperty('display', 'block', 'important');
    wrapper.style.setProperty('visibility', 'visible', 'important');
    wrapper.style.setProperty('opacity', '1', 'important');
  }
  if (panel) {
    panel.style.setProperty('display', 'block', 'important');
    panel.style.setProperty('visibility', 'visible', 'important');
    panel.style.setProperty('opacity', '1', 'important');
    const blocks = panel.querySelectorAll('.gjs-block');
    blocks.forEach((b) => {
      const el = b as HTMLElement;
      el.style.cursor = 'grab';
      el.style.pointerEvents = 'auto';
    });
  }
  if (editor?.BlockManager && panel && panel.querySelectorAll('.gjs-block').length === 0) {
    try {
      panel.innerHTML = '';
      editor.BlockManager.render();
    } catch {}
  }
}

export interface BlockDragHandlersOpts {
  onThemeReplaced?: (editor: any) => void;
}

/**
 * Set up block drag handlers. Ensures wrapper droppable on drag start, resolves drop target
 * from cursor element, appends block when GrapesJS misses the drop.
 */
export function setupBlockDragHandlers(
  editor: any,
  opts: BlockDragHandlersOpts = {}
): () => void {
  let lastCursorEl: Element | null = null;
  let lastBlock: any = null;
  let dragOverCleanup: (() => void) | null = null;
  let preDropHtml = '';
  let preDropCount = 0;

  const onDragStart = (block: any) => {
    lastCursorEl = null;
    lastBlock = block;
    if (dragOverCleanup) {
      dragOverCleanup();
      dragOverCleanup = null;
    }
    ensureWrapperDroppable(editor);
    const wrapper = editor?.getWrapper?.();
    if (wrapper) {
      preDropHtml = editor?.getHtml?.() ?? '';
      preDropCount = wrapper.components?.()?.length ?? 0;
      const el = wrapper.getEl?.();
      if (el) {
        (el as HTMLElement).style.pointerEvents = 'auto';
        (el as HTMLElement).style.minHeight = '600px';
      }
    }
    const frame = editor?.Canvas?.getFrameEl?.();
    const doc = frame?.contentDocument;
    if (doc) {
      const onDragOver = (ev: DragEvent) => {
        const t = ev?.target as Element;
        if (t?.nodeType === 1) lastCursorEl = t;
      };
      doc.addEventListener('dragover', onDragOver, true);
      dragOverCleanup = () => doc.removeEventListener('dragover', onDragOver, true);
    }
  };

  const onDragStop = (droppedComponent: any, block: any) => {
    const blockToAdd = block ?? lastBlock ?? null;
    lastBlock = null;

    if (dragOverCleanup) {
      dragOverCleanup();
      dragOverCleanup = null;
    }

    if (!blockToAdd?.get) return;

    const wrapper = editor?.getWrapper?.();

    // CRITICAL: If GrapesJS replaced the theme with only the dropped block, restore and append
    // Check component count regardless of droppedComponent - GrapesJS can pass block component with label
    if (wrapper && preDropHtml) {
      const newCount = wrapper.components?.()?.length ?? 0;
      if (newCount < preDropCount) {
        editor.setComponents(preDropHtml);
        try { runExpandAndConfigureSelectability(editor); } catch {}
        opts.onThemeReplaced?.(editor);
        setTimeout(() => {
          const t = getDropTarget(editor, lastCursorEl) ?? wrapper;
          appendBlockToTarget(editor, blockToAdd, t);
        }, 80);
        return;
      }
    }

    // Fallback: GrapesJS missed the drop - manually append (only when droppedComponent is null)
    if (!droppedComponent) {
      setTimeout(() => {
        const wrapper = editor?.getWrapper?.();
        if (!wrapper) return;
        const children = wrapper.components?.();
        if (!children?.length) {
          try { wrapper.append(DEFAULT_DROP_ZONE_HTML); } catch {}
        }
        const tgt = getDropTarget(editor, lastCursorEl);
        if (!tgt) return;
        const added = appendBlockToTarget(editor, blockToAdd, tgt);
        if (added) ensureStylePanelForSelection(editor);
      }, 80);
    }
  };

  editor.on('block:drag:start', onDragStart);
  editor.on('block:drag:stop', onDragStop);

  return () => {
    dragOverCleanup?.();
    editor.off?.('block:drag:start', onDragStart);
    try { editor.off?.('block:drag:stop', onDragStop); } catch {}
  };
}

/** Sync StyleManager to selected component. Call on component:selected. */
export function syncStylePanelToSelection(editor: any, component: any, stylePanelId = 'style-panel'): void {
  const panel = document.getElementById(stylePanelId);
  if (panel) {
    panel.style.display = 'block';
    panel.style.visibility = 'visible';
    panel.style.opacity = '1';
  }
  try {
    const sm = editor?.StyleManager;
    if (sm && component) (sm.setTarget || sm.select)?.call(sm, component);
  } catch {}
}
