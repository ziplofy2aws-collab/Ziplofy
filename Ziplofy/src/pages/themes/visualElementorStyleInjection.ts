/**
 * Visual Elementor – theme style injection into the canvas iframe.
 * From-scratch implementation matching BasicElementor injectCSS:
 * - removal selector
 * - inject order: preserve-text-color, slider-fix, selection-override, theme-styles, link tags, @import
 * - retry schedule and editor.setStyle fallback
 */

import { SELECTION_HIGHLIGHT_BASIC_CSS, SELECTION_OVERRIDE_CSS, SLIDER_FIX_CSS, POINTER_EVENTS_FINAL_CSS, GJS_IFRAME_OVERLAY_KILL_CSS } from './visualElementorThemeUtils';
import { forcePointerEventsForEditing } from './elementorThemeCanvas';

export interface InjectThemeStylesOptions {
  styleBlockContent: string;
  stylesheetUrls?: string[];
  baseUrl?: string;
}

const REMOVAL_SELECTOR = '#ziplofy-theme-styles, #ziplofy-preserve-text-color, #ziplofy-selection-highlight, #ziplofy-selection-override, #ziplofy-slider-fix, #ziplofy-pointer-events-final, #ziplofy-gjs-iframe-overlay-kill, style[data-ziplofy-theme], link[data-ziplofy-theme]';

function doInject(editor: any, options: InjectThemeStylesOptions): boolean {
  const { styleBlockContent: cssContent = '', stylesheetUrls = [], baseUrl = '' } = options;
  try {
    const canvas = editor.Canvas;
    if (!canvas) return false;
    const frame = canvas.getFrameEl();
    if (!frame?.contentDocument) return false;
    const doc = frame.contentDocument;
    const head = doc.head || doc.getElementsByTagName('head')[0];
    if (!head) return false;

    head.querySelectorAll(REMOVAL_SELECTOR).forEach((el) => el.remove());

    const append = (id: string, text: string) => {
      const el = doc.createElement('style');
      el.id = id;
      el.setAttribute('data-ziplofy-theme', 'true');
      el.textContent = text;
      head.appendChild(el);
    };

    append('ziplofy-selection-highlight', SELECTION_HIGHLIGHT_BASIC_CSS);
    append('ziplofy-selection-override', SELECTION_OVERRIDE_CSS);
    append('ziplofy-slider-fix', SLIDER_FIX_CSS);

    if (cssContent.trim()) {
      const styleEl = doc.createElement('style');
      styleEl.id = 'ziplofy-theme-styles';
      styleEl.setAttribute('data-ziplofy-theme', 'true');
      styleEl.textContent = cssContent;
      head.appendChild(styleEl);
    }

    stylesheetUrls.forEach((url) => {
      const link = doc.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.setAttribute('data-ziplofy-theme', 'true');
      link.crossOrigin = 'anonymous';
      head.appendChild(link);
    });

    if (cssContent) {
      const imports = cssContent.matchAll(/@import\s+(?:url\()?['"]?([^'")]+)['"]?\)?/gi);
      for (const m of imports) {
        let url = m[1];
        if (!url.startsWith('http') && !url.startsWith('//')) {
          if (url.startsWith('./') || url.startsWith('../')) {
            const parts = baseUrl.split('/').filter(Boolean);
            const path = url.split('/').filter(Boolean);
            for (const p of path) {
              if (p === '..') parts.pop();
              else if (p !== '.') parts.push(p);
            }
            url = parts.join('/');
            if (!url.startsWith('http')) url = baseUrl.replace(/\/[^/]*$/, '/') + url;
          } else {
            url = baseUrl + url;
          }
        }
        if (url && !Array.from(head.querySelectorAll('link[rel="stylesheet"]')).some((l: Element) => (l as HTMLAnchorElement).href === url || (l as HTMLAnchorElement).href?.endsWith?.(url))) {
          const link = doc.createElement('link');
          link.rel = 'stylesheet';
          link.href = url;
          link.setAttribute('data-ziplofy-theme', 'true');
          link.crossOrigin = 'anonymous';
          head.appendChild(link);
        }
      }
    }
    // CRITICAL: Inject pointer-events override LAST so it wins over theme CSS (themes often use pointer-events: none)
    append('ziplofy-pointer-events-final', POINTER_EVENTS_FINAL_CSS);
    // Grapes frame CSS may inject after head styles — append parent-outline kill to body so it wins the cascade
    try {
      doc.getElementById('ziplofy-gjs-iframe-overlay-kill')?.remove();
      const tail = doc.createElement('style');
      tail.id = 'ziplofy-gjs-iframe-overlay-kill';
      tail.setAttribute('data-ziplofy-theme', 'true');
      tail.textContent = GJS_IFRAME_OVERLAY_KILL_CSS;
      (doc.body || head).appendChild(tail);
    } catch (_) {}
    // JS pass overrides inline pointer-events: none (CSS cannot override inline styles)
    forcePointerEventsForEditing(frame as HTMLIFrameElement);
    return true;
  } catch (e) {
    return false;
  }
}

export function injectThemeStylesIntoFrame(editor: any, options: InjectThemeStylesOptions): boolean {
  return doInject(editor, options);
}

/**
 * Responsive viewport widths per device. Themes use width=device-width which in an iframe
 * equals iframe width. If the iframe is narrow, responsive themes render mobile layout.
 * We override viewport meta so the theme applies correct breakpoints per device.
 */
export const DEVICE_VIEWPORT_WIDTHS: Record<string, number> = {
  desktop: 1280,
  Desktop: 1280,
  tablet: 768,
  Tablet: 768,
  mobile: 375,
  Mobile: 375,
};

/**
 * Override viewport meta in iframe based on device. Ensures responsive themes render
 * correct layout: desktop breakpoints for desktop, tablet for tablet, mobile for mobile.
 */
export function injectViewportForDevice(editor: any, deviceId: string, containerWidth?: number): boolean {
  try {
    const canvas = editor.Canvas;
    if (!canvas) return false;
    const frame = canvas.getFrameEl?.();
    if (!frame?.contentDocument) return false;
    const doc = frame.contentDocument;
    const head = doc.head || doc.getElementsByTagName('head')[0];
    if (!head) return false;

    const dev = (deviceId || '').toLowerCase();
    let width: number;
    if (dev === 'desktop' && containerWidth != null && containerWidth > 0) {
      width = Math.max(containerWidth, DEVICE_VIEWPORT_WIDTHS.desktop);
    } else {
      width = DEVICE_VIEWPORT_WIDTHS[deviceId] ?? DEVICE_VIEWPORT_WIDTHS[dev] ?? DEVICE_VIEWPORT_WIDTHS.desktop;
    }

    let meta = head.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = doc.createElement('meta');
      meta.name = 'viewport';
      head.appendChild(meta);
    }
    meta.content = `width=${width}, initial-scale=1`;
    return true;
  } catch {
    return false;
  }
}

/** @deprecated Use injectViewportForDevice(editor, 'desktop', layoutWidth) */
export function injectDesktopViewportOverride(editor: any, layoutWidth: number = 1280): boolean {
  return injectViewportForDevice(editor, 'desktop', layoutWidth);
}

const RETRY_DELAYS_MS = [50, 100, 200, 400, 600, 1000, 1500, 2500, 3500, 5000];
const MAX_RETRIES = 15;
const RETRY_INTERVAL_MS = 200;

export function scheduleThemeStyleInjection(editor: any, options: InjectThemeStylesOptions): void {
  const { styleBlockContent = '' } = options;
  let retries = 0;

  const tryInject = () => {
    if (doInject(editor, options)) return;
    retries++;
    if (retries < MAX_RETRIES) {
      setTimeout(tryInject, RETRY_INTERVAL_MS);
    } else if (styleBlockContent.trim()) {
      try {
        editor.setStyle(styleBlockContent);
      } catch {}
    }
  };

  RETRY_DELAYS_MS.forEach((d) => setTimeout(tryInject, d));
}
