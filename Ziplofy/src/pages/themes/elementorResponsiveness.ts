/**
 * Elementor Theme Builder – Responsiveness
 *
 * Desktop / Tablet / Mobile switching. Critical: themes use width=device-width;
 * inside an iframe that = iframe width. We override viewport meta so themes see
 * the correct breakpoint. Desktop needs aggressive viewport guard (themes can
 * overwrite it via JS).
 */

export type DeviceId = 'desktop' | 'tablet' | 'mobile' | 'Desktop' | 'Tablet' | 'Mobile';

const DEVICES = {
  desktop: { viewportWidth: 1280, frameWidth: '100%' },
  tablet: { viewportWidth: 768, frameWidth: '768px' },
  mobile: { viewportWidth: 375, frameWidth: '375px' },
} as const;

const DESKTOP_VIEWPORT = 1280;

function toKey(id: string): keyof typeof DEVICES {
  const k = (id || 'desktop').toLowerCase();
  return (k === 'desktop' || k === 'tablet' || k === 'mobile' ? k : 'desktop') as keyof typeof DEVICES;
}

function getDeviceModel(dm: any, id: string): any {
  if (!dm?.get) return null;
  const k = toKey(id);
  return dm.get(id) ?? dm.get(k) ?? dm.get(k.charAt(0).toUpperCase() + k.slice(1));
}

/** Set viewport meta in iframe. Returns true if applied. */
function setViewportMeta(editor: any, width: number): boolean {
  try {
    const frame = editor?.Canvas?.getFrameEl?.();
    const doc = frame?.contentDocument;
    if (!doc?.head) return false;
    let meta = doc.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = doc.createElement('meta');
      meta.name = 'viewport';
      doc.head.appendChild(meta);
    }
    const target = `width=${width}, initial-scale=1`;
    if (meta.content === target) return true;
    meta.content = target;
    return true;
  } catch {
    return false;
  }
}

let desktopViewportGuard: MutationObserver | null = null;

/** For desktop: watch iframe head and re-apply viewport when theme overwrites it */
function startDesktopViewportGuard(editor: any): void {
  stopDesktopViewportGuard();
  try {
    const frame = editor?.Canvas?.getFrameEl?.();
    const doc = frame?.contentDocument;
    if (!doc?.head) return;
    const apply = () => setViewportMeta(editor, DESKTOP_VIEWPORT);
    desktopViewportGuard = new MutationObserver(() => {
      const meta = doc.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
      if (meta && !meta.content.startsWith(`width=${DESKTOP_VIEWPORT}`)) {
        apply();
      }
    });
    desktopViewportGuard.observe(doc.head, { childList: true, subtree: true, attributes: true, attributeFilter: ['content'] });
  } catch {}
}

export function stopDesktopViewportGuard(): void {
  if (desktopViewportGuard) {
    desktopViewportGuard.disconnect();
    desktopViewportGuard = null;
  }
}

/** Apply frame/canvas layout and viewport for the device */
function applyLayout(editor: any, deviceKey: keyof typeof DEVICES, containerWidth: number): void {
  const cfg = DEVICES[deviceKey];
  const isDesktop = deviceKey === 'desktop';
  const devWidthPx = isDesktop ? Math.max(containerWidth, DESKTOP_VIEWPORT) : cfg.viewportWidth;
  // Frame must fit container to avoid "theme going off to the right"; viewport meta stays at devWidthPx for breakpoints
  const frameW = isDesktop ? `${containerWidth}px` : cfg.frameWidth;

  const dm = editor?.DeviceManager;
  const devModel = getDeviceModel(dm, deviceKey);
  if (devModel?.set) {
    devModel.set({ width: `${devWidthPx}px` });
    editor?.Canvas?.getModel?.()?.updateDevice?.();
  }

  const frameModel = editor?.Canvas?.getFrame?.();
  if (frameModel?.set) {
    frameModel.set({ width: frameW, height: '' });
  }

  const frame = editor?.Canvas?.getFrameEl?.();
  if (frame) {
    const el = frame as HTMLElement;
    el.style.setProperty('width', frameW, 'important');
    el.style.setProperty('min-width', frameW, 'important');
    el.style.setProperty('flex', isDesktop ? '1 1 0%' : '0 0 auto', 'important');
    el.style.setProperty('flex-basis', isDesktop ? '0%' : 'auto', 'important');
    el.style.removeProperty('max-width');
  }

  const framesSel = '.gjs-cv-canvas__frames, .gjs-cv-canvas_frames, [class*="cv-canvas"][class*="frames"]';
  document.querySelectorAll(framesSel).forEach((el) => {
    const e = el as HTMLElement;
    e.style.setProperty('width', isDesktop ? frameW : cfg.frameWidth, 'important');
    e.style.setProperty('min-width', frameW, 'important');
    e.style.setProperty('flex', isDesktop ? '1 1 0%' : '0 0 auto', 'important');
    e.style.setProperty('flex-basis', isDesktop ? '0%' : 'auto', 'important');
    e.style.setProperty('justify-content', isDesktop ? 'flex-start' : 'center', 'important');
    e.style.setProperty('align-items', isDesktop ? 'stretch' : 'flex-start', 'important');
  });

  document.querySelectorAll('.gjs-frame-wrapper').forEach((el) => {
    const e = el as HTMLElement;
    e.style.setProperty('width', frameW, 'important');
    e.style.setProperty('min-width', frameW, 'important');
    e.style.setProperty('flex', isDesktop ? '1 1 0%' : '0 0 auto', 'important');
    e.style.setProperty('flex-basis', isDesktop ? '0%' : 'auto', 'important');
  });

  const canvas = document.querySelector('.gjs-cv-canvas') as HTMLElement;
  if (canvas) {
    canvas.style.setProperty('width', '100%', 'important');
    canvas.style.setProperty('flex', '1', 'important');
    canvas.style.setProperty('justify-content', isDesktop ? 'flex-start' : 'center', 'important');
    canvas.style.setProperty('align-items', isDesktop ? 'stretch' : 'flex-start', 'important');
  }

  const viewportWidth = isDesktop ? DESKTOP_VIEWPORT : cfg.viewportWidth;
  setViewportMeta(editor, viewportWidth);
  if (isDesktop) {
    startDesktopViewportGuard(editor);
  } else {
    stopDesktopViewportGuard();
  }
}

function getContainerWidth(): number {
  const el =
    document.querySelector('.builder-center-panel') ||
    document.querySelector('.gjs-editor-wrapper') ||
    document.querySelector('.basic-elementor-preview');
  const w = (el as HTMLElement)?.clientWidth || DESKTOP_VIEWPORT;
  return w;
}

/**
 * Apply responsive view. Call from: device button, change:device, canvas:frame:load, useEffect.
 */
export function applyResponsiveView(editor: any, deviceId: string): void {
  if (!editor) return;
  const key = toKey(deviceId);
  const containerWidth = getContainerWidth();
  applyLayout(editor, key, containerWidth);
}

/** Schedule repeated apply for desktop (GrapesJS/theme may overwrite). Returns cleanup. */
export function scheduleDesktopRetries(editor: any): () => void {
  const delays = [0, 50, 100, 200, 400, 800, 1500, 3000];
  const ids: ReturnType<typeof setTimeout>[] = [];
  delays.forEach((ms) => {
    ids.push(setTimeout(() => {
      const dev = editor?.getDevice?.() || editor?.DeviceManager?.getSelected?.()?.get?.('id');
      if (dev === 'desktop' || dev === 'Desktop') {
        applyResponsiveView(editor, 'desktop');
      }
    }, ms));
  });
  return () => ids.forEach(clearTimeout);
}
