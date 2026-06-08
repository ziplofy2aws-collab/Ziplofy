/**
 * Visual Elementor – theme load flow.
 * From-scratch implementation matching BasicElementor loadThemeIntoEditor behavior.
 * Single entry point for loading theme content into the editor.
 */

import { stripGrapesJSCanvasCss, preprocessHtmlForSelectability, cleanupCssGradients } from './visualElementorThemeUtils';
import { scheduleThemeStyleInjection } from './visualElementorStyleInjection';
import { setupCanvasForEditing, forcePointerEventsForEditing } from './elementorThemeCanvas';

export interface LoadThemeContentOptions {
  /** HTML body content */
  html: string;
  /** CSS from inline <style> tags */
  css?: string;
  /** Fetched/external CSS combined (used when stylesheetUrls present) */
  inlineCssForStyleBlock?: string;
  /** External stylesheet URLs */
  stylesheetUrls?: string[];
  /** Base URL for resolving @import in CSS */
  baseUrl?: string;
  /** Fallback when html is empty */
  defaultContent?: string;
}

/**
 * Load theme content into the GrapesJS editor.
 * Matches BasicElementor: strip, preprocess, setComponents, expand+configure (100ms), inject styles.
 */
export function loadThemeContentIntoEditor(editor: any, options: LoadThemeContentOptions): void {
  const {
    html = '',
    css = '',
    inlineCssForStyleBlock,
    stylesheetUrls = [],
    baseUrl = '',
    defaultContent = '',
  } = options;

  const rawHtml = html || defaultContent;
  let processedHtml = stripGrapesJSCanvasCss(rawHtml);
  processedHtml = preprocessHtmlForSelectability(processedHtml);
  // Use full combined CSS (inline + fetched external) for complete theme load – page.css has everything
  let cssContent = (css && css.trim()) || (inlineCssForStyleBlock && inlineCssForStyleBlock.trim()) || '';
  const hasCss = cssContent.length > 0 || stylesheetUrls.length > 0;
  if (cssContent) {
    cssContent = cleanupCssGradients(cssContent);
  }
  const styleBlockContent = cssContent;
  editor.setComponents(processedHtml || defaultContent);
  requestAnimationFrame(() => {
    try {
      setupCanvasForEditing(editor);
    } catch (e) {
      console.warn('Setup canvas for editing:', e);
    }
  });
  // Match Basic Elementor: expand at 100ms; additional passes for slow canvas (GrapesJS needs time to parse)
  [100, 250, 500, 800].forEach((ms) => {
    setTimeout(() => {
      try {
        setupCanvasForEditing(editor);
      } catch {}
    }, ms);
  });

  scheduleThemeStyleInjection(editor, {
    styleBlockContent,
    stylesheetUrls,
    baseUrl,
  });

  // Re-run pointer-events fix after async stylesheets load (themes use link tags that load late)
  [1500, 3000, 5000].forEach((ms) => {
    setTimeout(() => {
      try {
        const frame = editor?.Canvas?.getFrameEl?.();
        forcePointerEventsForEditing(frame);
      } catch {}
    }, ms);
  });
}
