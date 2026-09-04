export type AspectRatioKey =
  | 'original'
  | '1:1'
  | '3:2'
  | '5:4'
  | '7:5'
  | '16:9'
  | 'freeform';

export type CropRect = { x: number; y: number; w: number; h: number };

export type DrawStroke = {
  color: string;
  size: number;
  points: Array<{ x: number; y: number }>;
};

/** Working bitmap in the editor — canvas is used for local Apply when blob export is blocked. */
export type EditableBitmap = HTMLImageElement | HTMLCanvasElement;

export function bitmapDimensions(source: EditableBitmap): { width: number; height: number } {
  if (source instanceof HTMLCanvasElement) {
    return { width: Math.max(1, source.width), height: Math.max(1, source.height) };
  }
  return {
    width: Math.max(1, source.naturalWidth || source.width),
    height: Math.max(1, source.naturalHeight || source.height),
  };
}

export function bitmapCacheKey(source: EditableBitmap): string {
  if (source instanceof HTMLCanvasElement) {
    return `canvas:${source.width}x${source.height}`;
  }
  return `${source.src}|${source.naturalWidth}x${source.naturalHeight}`;
}

export function cloneCanvasBitmap(source: HTMLCanvasElement): HTMLCanvasElement {
  const clone = document.createElement('canvas');
  clone.width = Math.max(1, source.width);
  clone.height = Math.max(1, source.height);
  const ctx = clone.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(source, 0, 0);
  }
  return clone;
}

export const ASPECT_RATIO_OPTIONS: Array<{ key: AspectRatioKey; label: string; ratio: number | null }> = [
  { key: 'original', label: 'Original', ratio: null },
  { key: '1:1', label: 'Square', ratio: 1 },
  { key: '3:2', label: '3:2', ratio: 3 / 2 },
  { key: '5:4', label: '5:4', ratio: 5 / 4 },
  { key: '7:5', label: '7:5', ratio: 7 / 5 },
  { key: '16:9', label: '16:9', ratio: 16 / 9 },
  { key: 'freeform', label: 'Freeform', ratio: null },
];

export function fileNameFromImageUrl(url: string): string {
  try {
    const path = new URL(url, window.location.origin).pathname;
    const name = path.split('/').pop();
    return name ? decodeURIComponent(name) : 'image';
  } catch {
    const parts = url.split('/');
    return decodeURIComponent(parts[parts.length - 1] || 'image');
  }
}

function loadHtmlImage(
  src: string,
  opts?: { crossOrigin?: 'anonymous' | 'use-credentials' }
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (opts?.crossOrigin) img.crossOrigin = opts.crossOrigin;
    img.decoding = 'async';
    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) {
        reject(new Error('Image has zero size'));
        return;
      }
      resolve(img);
    };
    img.onerror = () => reject(new Error('Could not load image for editing'));
    img.src = src;
  });
}

function toAbsoluteImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:') ||
    /^https?:\/\//i.test(trimmed)
  ) {
    return trimmed;
  }
  try {
    return new URL(trimmed, window.location.href).href;
  } catch {
    return trimmed;
  }
}

function isLikelyImageBlob(blob: Blob): boolean {
  if (blob.type.startsWith('image/')) return true;
  // Some CDNs omit content-type; allow non-empty blobs and let Image decode decide.
  return blob.size > 32 && !blob.type.includes('html') && !blob.type.includes('json');
}

export type ImageEditorFetchOptions = {
  /** Same-origin blob fetch (e.g. store media API proxy) — tried before cross-origin S3. */
  fetchBlob?: (url: string) => Promise<Blob>;
};

async function loadedImageFromBlob(blob: Blob): Promise<{
  image: HTMLImageElement;
  objectUrl: string;
  naturalWidth: number;
  naturalHeight: number;
}> {
  if (!isLikelyImageBlob(blob)) {
    throw new Error('Downloaded file is not an image');
  }
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = await loadHtmlImage(objectUrl);
    return {
      image,
      objectUrl,
      naturalWidth: image.naturalWidth || image.width,
      naturalHeight: image.naturalHeight || image.height,
    };
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    throw err;
  }
}

/** Load image for the editor. Prefer a blob URL (export-safe); fall back to plain img load. */
export async function loadEditableImage(
  url: string,
  options?: ImageEditorFetchOptions
): Promise<{
  image: HTMLImageElement;
  objectUrl: string | null;
  naturalWidth: number;
  naturalHeight: number;
}> {
  const absolute = toAbsoluteImageUrl(url);
  if (!absolute) {
    throw new Error('No image selected');
  }

  // data: / blob: — load directly (do not revoke caller-owned blob URLs)
  if (absolute.startsWith('data:') || absolute.startsWith('blob:')) {
    const image = await loadHtmlImage(absolute);
    return {
      image,
      objectUrl: null,
      naturalWidth: image.naturalWidth || image.width,
      naturalHeight: image.naturalHeight || image.height,
    };
  }

  // 0) Same-origin API proxy (store media — avoids S3 CORS canvas taint)
  if (options?.fetchBlob) {
    for (const candidate of Array.from(new Set([url.trim(), absolute].filter(Boolean)))) {
      try {
        return await loadedImageFromBlob(await options.fetchBlob(candidate));
      } catch {
        /* try next candidate / fall through */
      }
    }
  }

  // 1) Fetch → object URL (best for canvas export when CORS allows it)
  for (const credentials of ['omit', 'same-origin', 'include'] as RequestCredentials[]) {
    try {
      const res = await fetch(absolute, { mode: 'cors', credentials });
      if (!res.ok) continue;
      const blob = await res.blob();
      if (!isLikelyImageBlob(blob)) continue;
      const objectUrl = URL.createObjectURL(blob);
      try {
        const image = await loadHtmlImage(objectUrl);
        return {
          image,
          objectUrl,
          naturalWidth: image.naturalWidth || image.width,
          naturalHeight: image.naturalHeight || image.height,
        };
      } catch {
        URL.revokeObjectURL(objectUrl);
      }
    } catch {
      /* CORS or network — try next credentials / direct load */
    }
  }

  // 2) Same as sidebar <img>: no crossOrigin (relative first, then absolute)
  const directCandidates = Array.from(
    new Set([url.trim(), absolute].filter((u) => Boolean(u)))
  );
  for (const candidate of directCandidates) {
    try {
      const image = await loadHtmlImage(candidate);
      return {
        image,
        objectUrl: null,
        naturalWidth: image.naturalWidth || image.width,
        naturalHeight: image.naturalHeight || image.height,
      };
    } catch {
      /* try next */
    }
  }

  // 3) Last attempt with CORS flag (some hosts require it for canvas)
  const image = await loadHtmlImage(absolute, { crossOrigin: 'anonymous' });
  return {
    image,
    objectUrl: null,
    naturalWidth: image.naturalWidth || image.width,
    naturalHeight: image.naturalHeight || image.height,
  };
}

export function normalizedRotation(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Size of the image after 90°-step rotation (before flip). */
export function rotatedBounds(width: number, height: number, rotation: number): {
  width: number;
  height: number;
} {
  const r = normalizedRotation(rotation);
  if (r === 90 || r === 270) return { width: height, height: width };
  return { width, height };
}

export function fullCrop(width: number, height: number): CropRect {
  return { x: 0, y: 0, w: width, h: height };
}

export function clampCrop(crop: CropRect, width: number, height: number): CropRect {
  const w = Math.max(1, Math.min(crop.w, width));
  const h = Math.max(1, Math.min(crop.h, height));
  const x = Math.max(0, Math.min(crop.x, width - w));
  const y = Math.max(0, Math.min(crop.y, height - h));
  return { x, y, w, h };
}

export function cropForAspect(
  width: number,
  height: number,
  aspect: AspectRatioKey,
  originalRatio: number
): CropRect {
  const opt = ASPECT_RATIO_OPTIONS.find((o) => o.key === aspect);
  if (!opt || aspect === 'freeform') return fullCrop(width, height);
  const ratio = aspect === 'original' ? originalRatio : (opt.ratio ?? originalRatio);
  if (!ratio || !Number.isFinite(ratio) || ratio <= 0) return fullCrop(width, height);

  let w = width;
  let h = w / ratio;
  if (h > height) {
    h = height;
    w = h * ratio;
  }
  return clampCrop({ x: (width - w) / 2, y: (height - h) / 2, w, h }, width, height);
}

/** Draw source image with rotation + flips into an offscreen canvas (full frame). */
export function renderTransformedImage(
  source: EditableBitmap,
  rotation: number,
  flipH: boolean,
  flipV: boolean
): HTMLCanvasElement {
  const { width: srcW, height: srcH } = bitmapDimensions(source);
  const bounds = rotatedBounds(srcW, srcH, rotation);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bounds.width));
  canvas.height = Math.max(1, Math.round(bounds.height));
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((normalizedRotation(rotation) * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(source, -srcW / 2, -srcH / 2, srcW, srcH);
  ctx.restore();
  return canvas;
}

export function exportEditedImage(options: {
  source: EditableBitmap;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  crop: CropRect;
  outputWidth: number;
  outputHeight: number;
  strokes: DrawStroke[];
}): HTMLCanvasElement {
  const { source, rotation, flipH, flipV, crop, outputWidth, outputHeight, strokes } = options;
  const transformed = renderTransformedImage(source, rotation, flipH, flipV);
  const cropX = Math.round(crop.x);
  const cropY = Math.round(crop.y);
  const cropW = Math.max(1, Math.round(crop.w));
  const cropH = Math.max(1, Math.round(crop.h));

  const out = document.createElement('canvas');
  out.width = Math.max(1, Math.round(outputWidth));
  out.height = Math.max(1, Math.round(outputHeight));
  const ctx = out.getContext('2d');
  if (!ctx) return out;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(transformed, cropX, cropY, cropW, cropH, 0, 0, out.width, out.height);

  const sx = out.width / cropW;
  const sy = out.height / cropH;
  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = Math.max(1, stroke.size * ((sx + sy) / 2));
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    stroke.points.forEach((p, i) => {
      const x = (p.x - crop.x) * sx;
      const y = (p.y - crop.y) * sy;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  return out;
}

export function canvasToPngFile(canvas: HTMLCanvasElement, fileName: string): Promise<File> {
  return new Promise((resolve, reject) => {
    try {
      // Probe taint early — toBlob can return null without throwing.
      try {
        canvas.toDataURL('image/png');
      } catch {
        reject(
          new Error(
            'Could not export image. This file host blocks canvas export (CORS). Re-upload the image to store files, then edit again.'
          )
        );
        return;
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not export edited image. Please try again.'));
            return;
          }
          const base = fileName.replace(/\.[^.]+$/, '') || 'edited-image';
          resolve(new File([blob], `${base}-edited.png`, { type: 'image/png' }));
        },
        'image/png',
        0.92
      );
    } catch (err: unknown) {
      reject(
        err instanceof Error
          ? err
          : new Error('Could not export image (CORS may block editing this URL)')
      );
    }
  });
}

export function canvasToImageElement(canvas: HTMLCanvasElement): Promise<{
  image: HTMLImageElement;
  objectUrl: string;
}> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toDataURL('image/png');
    } catch {
      reject(new Error('Could not resize image (CORS). Re-upload to store Files, then edit again.'));
      return;
    }
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not resize image. Please try again.'));
          return;
        }
        const objectUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => resolve({ image: img, objectUrl });
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Could not load resized image'));
        };
        img.src = objectUrl;
      },
      'image/png',
      0.92
    );
  });
}

/**
 * Adopt an edited canvas as the next working bitmap — fully local, never fetches.
 * Prefer a blob-backed Image when the canvas is exportable; otherwise keep a canvas clone
 * (drawImage works even when toBlob is blocked by CORS taint).
 */
export async function adoptEditedCanvas(canvas: HTMLCanvasElement): Promise<{
  image: EditableBitmap;
  objectUrl: string | null;
}> {
  try {
    const baked = await canvasToImageElement(canvas);
    return { image: baked.image, objectUrl: baked.objectUrl };
  } catch {
    return { image: cloneCanvasBitmap(canvas), objectUrl: null };
  }
}

export function isBitmapExportable(source: EditableBitmap): boolean {
  const probe = document.createElement('canvas');
  probe.width = 1;
  probe.height = 1;
  const probeCtx = probe.getContext('2d');
  if (!probeCtx) return false;
  try {
    probeCtx.drawImage(source, 0, 0, 1, 1);
    probe.toDataURL('image/png');
    return true;
  } catch {
    return false;
  }
}

async function fetchImageAsObjectUrl(
  url: string,
  options?: ImageEditorFetchOptions
): Promise<{
  image: HTMLImageElement;
  objectUrl: string;
}> {
  const absolute = toAbsoluteImageUrl(url);
  const candidates = Array.from(new Set([absolute, url.trim()].filter(Boolean)));
  let lastError: Error | null = null;

  if (options?.fetchBlob) {
    for (const candidate of candidates) {
      try {
        const loaded = await loadedImageFromBlob(await options.fetchBlob(candidate));
        return { image: loaded.image, objectUrl: loaded.objectUrl };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Could not download image');
      }
    }
  }

  const fetchModes: Array<RequestCredentials> = ['omit', 'same-origin', 'include'];

  for (const candidate of candidates) {
    if (candidate.startsWith('blob:') || candidate.startsWith('data:')) {
      try {
        const res = await fetch(candidate);
        if (!res.ok) {
          lastError = new Error(`Download failed (${res.status})`);
          continue;
        }
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        try {
          const image = await loadHtmlImage(objectUrl);
          return { image, objectUrl };
        } catch (err) {
          URL.revokeObjectURL(objectUrl);
          lastError = err instanceof Error ? err : new Error('Could not decode image');
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Could not download image');
      }
      continue;
    }

    for (const credentials of fetchModes) {
      try {
        const res = await fetch(candidate, { mode: 'cors', credentials });
        if (!res.ok) {
          lastError = new Error(`Download failed (${res.status})`);
          continue;
        }
        const blob = await res.blob();
        if (!isLikelyImageBlob(blob)) {
          lastError = new Error('Downloaded file is not an image');
          continue;
        }
        const objectUrl = URL.createObjectURL(blob);
        try {
          const image = await loadHtmlImage(objectUrl);
          return { image, objectUrl };
        } catch (err) {
          URL.revokeObjectURL(objectUrl);
          lastError = err instanceof Error ? err : new Error('Could not decode image');
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Could not download image');
      }
    }
  }

  throw (
    lastError ??
    new Error(
      'Could not export image. Re-upload it to store Files first, then edit the uploaded copy.'
    )
  );
}

/**
 * Returns an image that can be drawn to canvas and exported.
 * Only used at Save — never call this from Apply (crop/resize stay browser-local).
 * Re-fetches only when the current bitmap is CORS-tainted.
 */
export async function ensureExportableImage(
  source: EditableBitmap,
  sourceUrl: string,
  options?: ImageEditorFetchOptions
): Promise<{ image: EditableBitmap; objectUrl: string | null }> {
  if (isBitmapExportable(source)) {
    return { image: source, objectUrl: null };
  }

  // Prefer same-origin blob/data already on the element before hitting the network.
  const src =
    source instanceof HTMLImageElement ? (source.src || '').trim() : '';
  const urls = Array.from(
    new Set(
      [src, sourceUrl.trim()].filter(
        (u) => Boolean(u) && (u.startsWith('blob:') || u.startsWith('data:') || /^https?:\/\//i.test(u) || u.startsWith('/'))
      )
    )
  );

  let lastError: Error | null = null;
  for (const url of urls) {
    try {
      return await fetchImageAsObjectUrl(url, options);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Could not download image');
    }
  }

  const raw = lastError?.message || '';
  if (/failed to fetch|cors|networkerror/i.test(raw)) {
    throw new Error(
      'Could not export this image for upload (CORS). Re-upload it to store Files first, then edit that copy.'
    );
  }

  throw (
    lastError ??
    new Error(
      'Could not export image. Re-upload it to store Files first, then edit the uploaded copy.'
    )
  );
}
