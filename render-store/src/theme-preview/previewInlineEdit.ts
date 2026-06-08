import type { ThemePreviewSelectionHint } from './previewBridge';

export function fieldPathFromNodeId(nodeId: string): string | null {
  if (!nodeId.startsWith('field:')) return null;
  return nodeId.slice('field:'.length);
}

export function hintForNodeId(
  nodeId: string,
  hints: ThemePreviewSelectionHint[]
): ThemePreviewSelectionHint | undefined {
  return hints.find((h) => h.nodeId === nodeId);
}

export function canInlineEdit(nodeId: string, hints: ThemePreviewSelectionHint[]): boolean {
  const path = fieldPathFromNodeId(nodeId);
  if (!path) return false;
  const hint = hintForNodeId(nodeId, hints);
  if (hint?.fieldType === 'boolean' || hint?.fieldType === 'color') return false;
  return true;
}

export function startInlineEdit(
  el: HTMLElement,
  hint: ThemePreviewSelectionHint | undefined
): string {
  const original = (el.textContent ?? '').trim();
  el.setAttribute('data-ziplofy-inline-editing', 'true');
  el.contentEditable = 'true';
  if (hint?.fieldType === 'textarea') {
    el.style.whiteSpace = 'pre-wrap';
  }
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
  return original;
}

export function stopInlineEdit(el: HTMLElement): void {
  el.contentEditable = 'false';
  el.removeAttribute('data-ziplofy-inline-editing');
  el.style.whiteSpace = '';
}
