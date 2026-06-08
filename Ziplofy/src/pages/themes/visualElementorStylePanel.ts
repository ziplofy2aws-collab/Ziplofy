/**
 * Visual Elementor – style panel integration.
 * From-scratch implementation: select element → show styles in panel → edit → apply to element.
 */

import { normalizeStyleManagerCSSValue } from './visualElementorThemeUtils';

const STYLE_PANEL_ID = 'style-panel';

function getPanel(): HTMLElement | null {
  return document.getElementById(STYLE_PANEL_ID);
}

/** Get the DOM element for a component (handles view.el, getEl, and wrapper elements). Exported for use in style handlers. */
/** When editor is provided and component is the wrapper, falls back to canvas .gjs-wrapper-body or body if primary lookup returns null. */
export function getComponentEl(component: any, editor?: any): HTMLElement | null {
  if (!component) return null;
  let el = component.getEl?.() ?? component.view?.el ?? (component.view?.$el?.[0]);
  if (el?.nodeType === 1) return el as HTMLElement;
  if (editor && component === editor.getWrapper?.()) {
    const body = (editor.Canvas as any)?.getBody?.();
    if (body?.nodeType === 1) return body as HTMLElement;
    const frame = editor.Canvas?.getFrameEl?.();
    const doc = frame?.contentDocument;
    el = doc?.querySelector?.('.gjs-wrapper-body') ?? doc?.body ?? null;
    if (el?.nodeType === 1) return el as HTMLElement;
  }
  return null;
}

/** Apply a style property from the panel to the component and its DOM element. Forces immediate DOM update. */
function applyStyleToComponent(component: any, property: string, value: string, editor?: any): void {
  if (!component || !property) return;
  try {
    const normalized = normalizeStyleManagerCSSValue(property, String(value));
    if (normalized === null) return;
    const cssProp = property.replace(/([A-Z])/g, '-$1').toLowerCase();
    component.addStyle?.({ [property]: normalized });
    const el = getComponentEl(component, editor);
    if (el?.style?.setProperty) {
      el.style.setProperty(cssProp, normalized, 'important');
    }
    // CssComposer fallback: add rule for layout/background so styles override theme CSS
    const css = (editor?.Css || editor?.CssComposer) as any;
    if (css?.setRule && el) {
      let selector: string | null = null;
      const compId = component.getId?.();
      const elId = (el as HTMLElement).id;
      if (compId && /^[a-zA-Z][\w-]*$/.test(compId)) {
        selector = `#${compId}`;
      } else if (elId && /^[a-zA-Z][\w-]*$/.test(elId)) {
        selector = `#${elId}`;
      }
      if (selector) {
        try {
          css.setRule(selector, { [cssProp]: normalized }, { addStyles: true });
        } catch (_) {}
      }
      // Wrapper: use .gjs-wrapper-body selector
      const wrapper = editor?.getWrapper?.();
      if (component === wrapper && css?.setRule) {
        try {
          css.setRule('.gjs-wrapper-body', { [cssProp]: normalized }, { addStyles: true });
        } catch (_) {}
      }
    }
    if (component.view?.updateStyle) component.view.updateStyle();
    editor?.refresh?.();
  } catch {}
}

/** Check if a color value is black/default (should not be auto-applied – preserve theme color) */
export function isDefaultBlackColor(v: string | undefined | null): boolean {
  if (v == null || String(v).trim() === '') return true;
  const s = String(v).trim();
  return /^(rgb\(0,\s*0,\s*0\)|rgba\(0,\s*0,\s*0[^)]*\)|black|#000(?:000)?(?:ff)?)$/i.test(s);
}

/** Strip black/default color that GrapesJS/StyleManager applies on select – color persists until user explicitly changes it */
function clearBlackInlineColor(comp: any): void {
  if (!comp) return;
  try {
    const el = comp.getEl?.();
    const color = comp.getStyle?.()?.color ?? el?.style?.color;
    if (isDefaultBlackColor(color as string)) {
      if (el?.style) el.style.removeProperty('color');
      try { comp.removeStyle?.('color'); } catch {}
    }
    (comp.components?.() || []).forEach((c: any) => clearBlackInlineColor(c));
  } catch {}
}

const BODY_HIGHLIGHT_CLASS = 'ziplofy-body-selected';

/** Add/remove visual highlight on body when wrapper is selected (body has no default dashed border) */
export function updateBodySelectionHighlight(editor: any, selected: any): void {
  try {
    const wrapper = editor?.getWrapper?.();
    const frame = editor?.Canvas?.getFrameEl?.();
    const doc = frame?.contentDocument;
    if (!doc) return;
    const body = doc.body;
    const wrapperBody = doc.querySelector?.('.gjs-wrapper-body');
    const isWrapper = selected && wrapper && selected === wrapper;
    const targets = [body, wrapperBody].filter(Boolean);
    targets.forEach((el: Element) => {
      if (!el) return;
      if (isWrapper) {
        el.classList.add(BODY_HIGHLIGHT_CLASS);
      } else {
        el.classList.remove(BODY_HIGHLIGHT_CLASS);
      }
    });
  } catch (_) {}
}

/**
 * Sync StyleManager to the selected component and render into the style panel.
 * Call this when a component is selected so the panel shows its styles.
 */
export function syncStylePanelWithSelection(editor: any): void {
  const panel = getPanel();
  const sm = editor?.StyleManager;
  const selected = editor?.getSelected?.();
  if (!panel || !sm || !selected) return;

  const card = panel.closest('.elementor-panel-card[data-panel-type="style"]') as HTMLElement;
  if (card) {
    card.style.display = 'flex';
    card.style.visibility = 'visible';
    card.style.opacity = '1';
  }
  panel.style.display = 'block';
  panel.style.visibility = 'visible';
  panel.style.opacity = '1';
  panel.style.width = '100%';
  panel.style.minHeight = '300px';

  try {
    if (typeof sm.select === 'function') sm.select(selected);
    else if (typeof sm.setTarget === 'function') sm.setTarget(selected);

    const smEl = sm.render?.();
    if (smEl) {
      const node = (smEl as any).el ?? smEl;
      if (node?.nodeType === 1) {
        // Always clear before append to avoid duplicate sector/UI (repeating style panel)
        panel.innerHTML = '';
        panel.appendChild(node);
        // Do not force sectors open – allow user to collapse/expand (minimize) subsections
        // Force StyleManager to refresh inputs with selected component's current styles
        requestAnimationFrame(() => {
          try {
            if (typeof sm.select === 'function') sm.select(selected);
            else if (typeof sm.setTarget === 'function') sm.setTarget(selected);
            updateBodySelectionHighlight(editor, selected);
            // For nav/header/section (containers), scroll Background sector into view so user can change background color
            const tag = (selected?.get?.('tagName') || '').toLowerCase();
            const isContainer = ['nav', 'header', 'footer', 'section', 'div', 'main', 'aside'].includes(tag);
            if (isContainer && panel) {
              setTimeout(() => {
                const bgSector = Array.from(panel.querySelectorAll('.gjs-sm-sector')).find(
                  (el) => (el.textContent || '').toLowerCase().includes('background')
                );
                bgSector?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
              }, 100);
            }
            // Wrapper/body: re-render panel after short delay so Layout/Background sectors appear
            const wrapper = editor?.getWrapper?.();
            if (selected === wrapper) {
              setTimeout(() => {
                try {
                  sm.select?.(selected) || sm.setTarget?.(selected);
                  const reNode = sm.render?.();
                  const reEl = reNode && ((reNode as any).el ?? reNode);
                  if (reEl?.nodeType === 1 && panel) {
                    panel.innerHTML = '';
                    panel.appendChild(reEl);
                  }
                } catch (_) {}
              }, 50);
            }
          } catch (_) {}
        });
        updateBodySelectionHighlight(editor, selected);
      }
    }
  } catch (_) {}
}

/**
 * Setup handlers so style changes from the panel apply to the selected component.
 * GrapesJS fires style:property:update; we also wire property change listeners.
 */
export function setupStyleChangeHandlers(editor: any, onHasChanges?: () => void): () => void {
  const unsub: Array<() => void> = [];

  const applyChange = (propName: string, value: string) => {
    const selected = editor.getSelected?.();
    if (selected && propName) applyStyleToComponent(selected, propName, value, editor);
    onHasChanges?.();
  };

  editor.on('style:property:update', (data: any) => {
    try {
      const prop = data?.property ?? data;
      const propName = prop?.get?.('property') ?? prop?.getName?.();
      const value = prop?.getFullValue?.() ?? prop?.getValue?.() ?? data?.value;
      if (!propName || value === undefined) return;
      // Block default black color – preserve theme color until user explicitly changes it
      if (propName === 'color' && isDefaultBlackColor(String(value))) return;
      applyChange(propName, String(value));
    } catch {}
  });

  try {
    const sm = editor.StyleManager;
    if (sm?.getSectors) {
      sm.getSectors().forEach((sector: any) => {
        (sector.getProperties?.() || []).forEach((prop: any) => {
          if (prop?.on) {
            const handler = () => {
              const name = prop.get?.('property') || prop.getName?.();
              const val = prop.getFullValue?.() || prop.getValue?.() || prop.get?.('value');
              if (name && val !== undefined) applyChange(name, String(val));
            };
            prop.on('change:value', handler);
            unsub.push(() => { try { prop.off?.('change:value', handler); } catch {} });
          }
        });
      });
    }
  } catch (_) {}

  return () => unsub.forEach(f => f());
}

/**
 * Clear black/default inline color on component:deselected (StyleManager can leave it on previous element).
 * Ensures color persists until user explicitly changes it.
 */
export function onComponentDeselected(editor: any, component: any): void {
  if (editor) {
    updateBodySelectionHighlight(editor, null);
  }
  if (component) {
    clearBlackInlineColor(component);
    setTimeout(() => clearBlackInlineColor(component), 0);
    setTimeout(() => clearBlackInlineColor(component), 50);
    setTimeout(() => clearBlackInlineColor(component), 150);
    setTimeout(() => clearBlackInlineColor(component), 300);
    setTimeout(() => clearBlackInlineColor(component), 500);
  }
}

/**
 * Clear black/default inline color when component is selected (GrapesJS/StyleManager may apply it).
 * Run immediately and with delays to override StyleManager default – color persists until user changes it.
 */
export function onComponentSelected(component: any): void {
  if (component) {
    clearBlackInlineColor(component);
    setTimeout(() => clearBlackInlineColor(component), 0);
    setTimeout(() => clearBlackInlineColor(component), 50);
    setTimeout(() => clearBlackInlineColor(component), 100);
    setTimeout(() => clearBlackInlineColor(component), 200);
    setTimeout(() => clearBlackInlineColor(component), 400);
    setTimeout(() => clearBlackInlineColor(component), 600);
  }
}
