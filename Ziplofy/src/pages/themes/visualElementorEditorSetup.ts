/**
 * Visual Elementor – editor setup after theme HTML is loaded.
 * Central config for selectable, droppable, editable components.
 */

/** Tags that can contain other components (accept drops) */
export const CONTAINER_TAGS = new Set([
  'div', 'section', 'main', 'article', 'header', 'footer', 'nav', 'aside', 'form',
  'ul', 'ol', 'li', 'figure', 'figcaption', 'table', 'tbody', 'thead', 'tfoot', 'tr',
  'td', 'th', 'fieldset', 'details', 'summary'
]);

/** Tags that typically hold editable text */
export const TEXT_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'label', 'li', 'td', 'th',
  'button', 'strong', 'em', 'b', 'i', 'u', 'small', 'sub', 'sup', 'blockquote',
  'cite', 'img', 'figcaption', 'legend'
]);

function expandComponentContent(comp: any): boolean {
  if (!comp) return false;
  let changed = false;
  const content = comp.get?.('content');
  const children = comp.components?.();
  const hasHtmlContent = typeof content === 'string' && /<[a-z][a-z0-9]*[\s>]/i.test(content);
  if (hasHtmlContent && (!children || children.length === 0)) {
    try {
      comp.set('content', '', { silent: true });
      const appended = comp.append?.(content);
      if (appended?.length) changed = true;
      else {
        comp.set('content', content, { silent: true });
      }
    } catch (e) {
      comp.set('content', content, { silent: true });
      // InvalidCharacterError (empty tag name) - content may have malformed HTML
    }
  }
  (comp.components?.() || []).forEach((c: any) => {
    try {
      const tagName = (c.get?.('tagName') || '').trim();
      if (!tagName) return; // Skip components with empty tagName (prevents createElement(''))
      if (expandComponentContent(c)) changed = true;
    } catch (_) {}
  });
  return changed;
}

const DEBUG_SELECTABILITY = false;

function configureAllNested(comp: any, stats?: { configured: number; skipped: string[] }): void {
  if (!comp) return;
  try {
    const children = comp.components?.() || [];
    const tagName = (comp.get?.('tagName') || '').toLowerCase();
    if (!tagName || !/^[a-z][a-z0-9-]*$/i.test(tagName)) {
      if (DEBUG_SELECTABILITY && stats) stats.skipped.push(tagName || '(empty)');
      // Still set selectable/hoverable so the ~195 components with empty tagName become clickable
      try { comp.set({ selectable: true, hoverable: true, highlightable: true, draggable: true, stylable: true }, { silent: true }); if (stats) stats.configured++; } catch (_) {}
      children.forEach((c: any) => configureAllNested(c, stats));
      return;
    }
    const attrs = comp.getAttributes?.() || {};
    const isDroppable = attrs['data-gjs-droppable'] === '*' || CONTAINER_TAGS.has(tagName);
    const hasText = typeof comp.get?.('content') === 'string' && (comp.get('content') || '').trim().length > 0;
    const hasNoChildren = !children || children.length === 0;
    const isEditable = attrs['data-gjs-editable'] === 'true' || attrs['data-gjs-type'] === 'text' || TEXT_TAGS.has(tagName) || (hasText && hasNoChildren);
    comp.set({
      selectable: true,
      hoverable: true,
      highlightable: true,
      draggable: true,
      stylable: true,
      droppable: isDroppable ? '*' : false,
      editable: isEditable,
    }, { silent: true });
    if (DEBUG_SELECTABILITY && stats) stats.configured++;
    children.forEach((c: any) => configureAllNested(c, stats));
  } catch {}
}

/**
 * Expand + configure selectability for a single component subtree only.
 * Use this when adding a new widget so we never touch existing theme content.
 */
export function runExpandAndConfigureSelectabilityForComponent(editor: any, comp: any): void {
  if (!comp) return;
  try {
    expandComponentContent(comp);
    configureAllNested(comp);
    if (comp.view?.render) comp.view.render();
  } catch (e) {
    console.warn('Configure selectability for component:', e);
  }
}

function isValidTagName(tagName: string): boolean {
  const t = (tagName || '').trim();
  return t.length > 0 && /^[a-z][a-z0-9-]*$/i.test(t);
}

/** Run after setComponents(html): expand nested HTML and configure all components. Matches BasicElementor. */
export function runExpandAndConfigureSelectability(editor: any): void {
  try {
    const wrapper = editor.getWrapper();
    if (!wrapper) return;
    (wrapper.components?.() || []).forEach((c: any) => {
      try {
        if (isValidTagName(c?.get?.('tagName'))) expandComponentContent(c);
      } catch (_) {}
    });
    // selectable: false on wrapper prevents body from being selected when clicking navbar/empty areas
    wrapper.set({ droppable: true, selectable: false, editable: false, draggable: false, hoverable: true, stylable: true }, { silent: true });
    if (!wrapper.getClasses().includes('gjs-wrapper-body')) wrapper.addClass('gjs-wrapper-body');
    const stats = DEBUG_SELECTABILITY ? { configured: 0, skipped: [] as string[] } : undefined;
    (wrapper.components?.() || []).forEach((c: any) => {
      try {
        if (isValidTagName(c?.get?.('tagName'))) configureAllNested(c, stats);
      } catch (_) {}
    });
    if (wrapper.view?.render) wrapper.view.render();
    if (DEBUG_SELECTABILITY && stats && (stats.configured > 0 || stats.skipped.length > 0)) {
      const payload = { configured: stats.configured, skippedCount: stats.skipped.length, skippedSample: stats.skipped.slice(0, 20) };
      console.log('✓ Selectability', payload);
    } else {
      console.log('✓ Configured all elements for full selectability');
    }
  } catch (e) {
    console.warn('Configure selectability:', e);
  }
}
