/**
 * Elementor Theme Builder – canvas setup for editing.
 * Ensures wrapper is droppable and canvas accepts drops.
 */

import { runExpandAndConfigureSelectability } from './visualElementorEditorSetup';

/** Force pointer-events and user-select on all elements - overrides theme inline styles that block editing. Exported for use after style injection. */
export function forcePointerEventsForEditing(frame: HTMLIFrameElement | null | undefined): void {
  try {
    const doc = frame?.contentDocument;
    if (!doc?.body) return;
    const textTags = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'label', 'li', 'td', 'th', 'button', 'strong', 'em', 'b', 'i', 'u', 'small', 'blockquote', 'cite', 'figcaption']);
    const walk = (el: Element) => {
      if (el.nodeType !== 1) return;
      const html = el as HTMLElement;
      html.style.setProperty('pointer-events', 'auto', 'important');
      if (textTags.has(el.tagName.toLowerCase())) {
        html.style.setProperty('user-select', 'text', 'important');
        html.style.setProperty('-webkit-user-select', 'text', 'important');
      }
      el.childNodes.forEach((n) => walk(n as Element));
    };
    walk(doc.documentElement);
  } catch (_) {}
}

/** Configure canvas and wrapper so theme accepts drops and all elements are selectable */
export function setupCanvasForEditing(editor: any): void {
  if (!editor) return;
  try {
    const wrapper = editor.getWrapper();
    if (!wrapper) return;

    runExpandAndConfigureSelectability(editor);
    if (!wrapper.get('droppable')) {
      wrapper.set('droppable', '*');
    }

    const wrapperEl = wrapper.getEl?.();
    if (wrapperEl) {
      (wrapperEl as HTMLElement).style.pointerEvents = 'auto';
      (wrapperEl as HTMLElement).style.minHeight = '400px';
    }

    const canvas = editor.Canvas;
    if (canvas) {
      const canvasEl = canvas.getElement?.();
      if (canvasEl) (canvasEl as HTMLElement).style.pointerEvents = 'auto';

    const frame = canvas.getFrameEl?.();
    if (frame?.contentDocument?.body) {
      const body = frame.contentDocument.body as HTMLElement;
      body.style.pointerEvents = 'auto';
      forcePointerEventsForEditing(frame as HTMLIFrameElement);
    }
    }
  } catch (e) {
    console.warn('setupCanvasForEditing:', e);
  }
}
