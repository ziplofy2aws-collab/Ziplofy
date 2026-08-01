import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowsPointingOutIcon,
  ArrowsRightLeftIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  LockClosedIcon,
  LockOpenIcon,
  PencilIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useStore } from '../../../contexts/store.context';
import {
  defaultContentFilesFolder,
  useStoreCloudStorage,
} from '../../../contexts/store-cloud-storage.context';
import {
  ASPECT_RATIO_OPTIONS,
  type AspectRatioKey,
  type CropRect,
  type DrawStroke,
  canvasToImageElement,
  canvasToPngFile,
  clampCrop,
  cropForAspect,
  ensureExportableImage,
  exportEditedImage,
  fileNameFromImageUrl,
  fullCrop,
  loadEditableImage,
  renderTransformedImage,
  rotatedBounds,
} from './theme-editor-image-editor.utils';

export type ThemeEditorImageEditorSheetProps = {
  open: boolean;
  imageUrl: string;
  onClose: () => void;
  onSaved: (url: string) => void;
};

type AccordionId = 'info' | 'crop' | 'resize' | 'draw';
type DragMode =
  | null
  | 'move'
  | 'pan'
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | 'ne'
  | 'nw'
  | 'se'
  | 'sw'
  | 'draw';

type EditSnapshot = {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  aspect: AspectRatioKey;
  crop: CropRect;
  outW: number;
  outH: number;
  strokes: DrawStroke[];
  dirtyCrop: boolean;
};

const DRAW_COLORS = ['#ffffff', '#000000', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6'];

function cloneSnapshot(snap: EditSnapshot): EditSnapshot {
  return {
    ...snap,
    crop: { ...snap.crop },
    strokes: snap.strokes.map((s) => ({
      ...s,
      points: s.points.map((p) => ({ ...p })),
    })),
  };
}

function snapshotsEqual(a: EditSnapshot, b: EditSnapshot): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function Accordion({
  id,
  title,
  icon,
  openId,
  onToggle,
  children,
}: {
  id: AccordionId;
  title: string;
  icon: React.ReactNode;
  openId: AccordionId | null;
  onToggle: (id: AccordionId) => void;
  children: React.ReactNode;
}) {
  const open = openId === id;
  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-[13px] font-medium text-white hover:bg-white/5"
      >
        <span className="text-white/70">{icon}</span>
        <span className="flex-1">{title}</span>
        <ChevronDownIcon
          className={`h-4 w-4 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open ? <div className="px-4 pb-4">{children}</div> : null}
    </div>
  );
}

export function ThemeEditorImageEditorSheet({
  open,
  imageUrl,
  onClose,
  onSaved,
}: ThemeEditorImageEditorSheetProps) {
  const { activeStoreId } = useStore();
  const { uploadFileForStoreQuiet, imageUploadLoading } = useStoreCloudStorage();

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applyingResize, setApplyingResize] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [source, setSource] = useState<HTMLImageElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);

  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [aspect, setAspect] = useState<AspectRatioKey>('original');
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 1, h: 1 });
  const [outW, setOutW] = useState(0);
  const [outH, setOutH] = useState(0);
  const [draftW, setDraftW] = useState('');
  const [draftH, setDraftH] = useState('');
  const [lockAspect, setLockAspect] = useState(true);
  const aspectLockRatioRef = useRef(1);
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [drawColor, setDrawColor] = useState('#ef4444');
  const [drawSize, setDrawSize] = useState(6);
  const [zoom, setZoom] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<AccordionId | null>('crop');
  const [dirtyCrop, setDirtyCrop] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stageSize, setStageSize] = useState({ w: 640, h: 420 });
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    startCrop: CropRect;
    scrollLeft?: number;
    scrollTop?: number;
  } | null>(null);
  const drawingRef = useRef<DrawStroke | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const historyRef = useRef<EditSnapshot[]>([]);
  const applyingHistoryRef = useRef(false);
  const editStateRef = useRef<EditSnapshot>({
    rotation: 0,
    flipH: false,
    flipV: false,
    aspect: 'original',
    crop: { x: 0, y: 0, w: 1, h: 1 },
    outW: 0,
    outH: 0,
    strokes: [],
    dirtyCrop: false,
  });

  editStateRef.current = {
    rotation,
    flipH,
    flipV,
    aspect,
    crop,
    outW,
    outH,
    strokes,
    dirtyCrop,
  };

  useEffect(() => {
    setDraftW(outW > 0 ? String(outW) : '');
    setDraftH(outH > 0 ? String(outH) : '');
    if (outW > 0 && outH > 0) {
      aspectLockRatioRef.current = outH / outW;
    }
  }, [outW, outH]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyRef.current.length - 1;
  const canDiscard = historyIndex > 0;

  const transformedSize = useMemo(
    () => rotatedBounds(naturalW, naturalH, rotation),
    [naturalW, naturalH, rotation]
  );
  const originalRatio = naturalW > 0 && naturalH > 0 ? naturalW / naturalH : 1;
  const fileName = useMemo(() => fileNameFromImageUrl(imageUrl), [imageUrl]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const frame = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const applySnapshot = useCallback((snap: EditSnapshot, opts?: { fromHistory?: boolean }) => {
    if (opts?.fromHistory) applyingHistoryRef.current = true;
    const next = cloneSnapshot(snap);
    editStateRef.current = next;
    setRotation(next.rotation);
    setFlipH(next.flipH);
    setFlipV(next.flipV);
    setAspect(next.aspect);
    setCrop(next.crop);
    setOutW(next.outW);
    setOutH(next.outH);
    setStrokes(next.strokes);
    setDirtyCrop(next.dirtyCrop);
    if (opts?.fromHistory) {
      window.requestAnimationFrame(() => {
        applyingHistoryRef.current = false;
      });
    }
  }, []);

  const pushHistory = useCallback((snap?: EditSnapshot) => {
    if (applyingHistoryRef.current) return;
    const nextSnap = cloneSnapshot(snap ?? editStateRef.current);
    setHistoryIndex((idx) => {
      const stack = historyRef.current.slice(0, idx + 1);
      const last = stack[stack.length - 1];
      if (last && snapshotsEqual(last, nextSnap)) return idx;
      stack.push(nextSnap);
      historyRef.current = stack;
      return stack.length - 1;
    });
  }, []);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const nextIndex = historyIndex - 1;
    const snap = historyRef.current[nextIndex];
    if (!snap) return;
    setHistoryIndex(nextIndex);
    applySnapshot(snap, { fromHistory: true });
  }, [historyIndex, applySnapshot]);

  const redo = useCallback(() => {
    if (historyIndex >= historyRef.current.length - 1) return;
    const nextIndex = historyIndex + 1;
    const snap = historyRef.current[nextIndex];
    if (!snap) return;
    setHistoryIndex(nextIndex);
    applySnapshot(snap, { fromHistory: true });
  }, [historyIndex, applySnapshot]);

  const discard = useCallback(() => {
    const initial = historyRef.current[0];
    if (!initial) return;
    historyRef.current = [cloneSnapshot(initial)];
    setHistoryIndex(0);
    applySnapshot(initial, { fromHistory: true });
    toast.success('Changes discarded');
  }, [applySnapshot]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, undo, redo]);

  useEffect(() => {
    if (!open || !imageUrl.trim()) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setAspect('original');
    setStrokes([]);
    setZoom(1);
    setDirtyCrop(false);
    setOpenAccordion('crop');
    setSaveError(null);
    historyRef.current = [];
    setHistoryIndex(0);

    loadEditableImage(imageUrl.trim())
      .then((loaded) => {
        if (cancelled) {
          if (loaded.objectUrl) URL.revokeObjectURL(loaded.objectUrl);
          return;
        }
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = loaded.objectUrl;
        setSource(loaded.image);
        setNaturalW(loaded.naturalWidth);
        setNaturalH(loaded.naturalHeight);
        const bounds = rotatedBounds(loaded.naturalWidth, loaded.naturalHeight, 0);
        const nextCrop = fullCrop(bounds.width, bounds.height);
        const initial: EditSnapshot = {
          rotation: 0,
          flipH: false,
          flipV: false,
          aspect: 'original',
          crop: nextCrop,
          outW: Math.round(nextCrop.w),
          outH: Math.round(nextCrop.h),
          strokes: [],
          dirtyCrop: false,
        };
        applySnapshot(initial);
        historyRef.current = [cloneSnapshot(initial)];
        setHistoryIndex(0);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError((err as Error)?.message || 'Failed to load image');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, imageUrl, applySnapshot]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const resetCropForTransform = useCallback(
    (nextRotation: number, nextAspect: AspectRatioKey) => {
      const bounds = rotatedBounds(naturalW, naturalH, nextRotation);
      const next = cropForAspect(bounds.width, bounds.height, nextAspect, originalRatio);
      const snap: EditSnapshot = {
        ...editStateRef.current,
        rotation: nextRotation,
        aspect: nextAspect,
        crop: next,
        outW: Math.round(next.w),
        outH: Math.round(next.h),
        dirtyCrop: false,
        strokes: [],
      };
      applySnapshot(snap);
      pushHistory(snap);
    },
    [naturalW, naturalH, originalRatio, applySnapshot, pushHistory]
  );

  const applyAspect = (key: AspectRatioKey) => {
    const next = cropForAspect(transformedSize.width, transformedSize.height, key, originalRatio);
    const snap: EditSnapshot = {
      ...editStateRef.current,
      aspect: key,
      crop: next,
      outW: Math.round(next.w),
      outH: Math.round(next.h),
      dirtyCrop: true,
    };
    applySnapshot(snap);
    pushHistory(snap);
  };

  useEffect(() => {
    if (!open) return;
    const syncStage = () => {
      const el = stageRef.current;
      if (!el) return;
      setStageSize({ w: el.clientWidth || 640, h: el.clientHeight || 420 });
    };
    syncStage();
    const timer = window.setTimeout(syncStage, 320);
    window.addEventListener('resize', syncStage);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', syncStage);
    };
  }, [open, visible, source, loading]);

  const viewLayout = useMemo(() => {
    const pad = 48;
    const availW = Math.max(120, stageSize.w - pad);
    const availH = Math.max(120, stageSize.h - pad);
    const baseScale = Math.min(
      availW / Math.max(1, transformedSize.width),
      availH / Math.max(1, transformedSize.height),
      1
    );
    const scale = baseScale * zoom;
    return {
      scale,
      displayW: transformedSize.width * scale,
      displayH: transformedSize.height * scale,
    };
  }, [transformedSize.width, transformedSize.height, zoom, stageSize.w, stageSize.h]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = source;
    if (!canvas || !img) return;
    const { scale, displayW, displayH } = viewLayout;
    canvas.width = Math.max(1, Math.round(displayW));
    canvas.height = Math.max(1, Math.round(displayH));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const transformed = renderTransformedImage(img, rotation, flipH, flipV);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(transformed, 0, 0, canvas.width, canvas.height);

    // Dim outside crop
    const cx = crop.x * scale;
    const cy = crop.y * scale;
    const cw = crop.w * scale;
    const ch = crop.h * scale;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.rect(cx, cy, cw, ch);
    ctx.fill('evenodd');

    // Crop border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(cx + 0.75, cy + 0.75, Math.max(0, cw - 1.5), Math.max(0, ch - 1.5));
    ctx.setLineDash([]);

    // Handles
    const hs = 8;
    const handles = [
      [cx, cy],
      [cx + cw / 2, cy],
      [cx + cw, cy],
      [cx + cw, cy + ch / 2],
      [cx + cw, cy + ch],
      [cx + cw / 2, cy + ch],
      [cx, cy + ch],
      [cx, cy + ch / 2],
    ];
    ctx.fillStyle = '#ffffff';
    for (const [hx, hy] of handles) {
      ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
    }

    // Draw strokes in view space
    for (const stroke of strokes) {
      if (stroke.points.length < 2) continue;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size * scale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      stroke.points.forEach((p, i) => {
        const x = p.x * scale;
        const y = p.y * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }, [source, rotation, flipH, flipV, crop, strokes, viewLayout]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => redraw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, redraw]);

  const pointerToImage = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * transformedSize.width;
    const y = ((clientY - rect.top) / rect.height) * transformedSize.height;
    return { x, y };
  };

  const hitHandle = (x: number, y: number): DragMode => {
    const tol = 14 / (viewLayout.scale || 1);
    const { x: cx, y: cy, w: cw, h: ch } = crop;
    const pts: Array<[number, number, DragMode]> = [
      [cx, cy, 'nw'],
      [cx + cw / 2, cy, 'n'],
      [cx + cw, cy, 'ne'],
      [cx + cw, cy + ch / 2, 'e'],
      [cx + cw, cy + ch, 'se'],
      [cx + cw / 2, cy + ch, 's'],
      [cx, cy + ch, 'sw'],
      [cx, cy + ch / 2, 'w'],
    ];
    for (const [px, py, mode] of pts) {
      if (Math.abs(x - px) <= tol && Math.abs(y - py) <= tol) return mode;
    }
    return null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!source || e.button !== 0) return;
    const stage = stageRef.current;
    const pt = pointerToImage(e.clientX, e.clientY);

    if (openAccordion === 'draw') {
      if (!pt) return;
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      const stroke: DrawStroke = { color: drawColor, size: drawSize, points: [pt] };
      drawingRef.current = stroke;
      setStrokes((prev) => [...prev, stroke]);
      dragRef.current = { mode: 'draw', startX: pt.x, startY: pt.y, startCrop: crop };
      return;
    }

    // Crop resize handles only — everything else pans the viewport.
    if (pt) {
      const handle = hitHandle(pt.x, pt.y);
      if (handle) {
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        dragRef.current = { mode: handle, startX: pt.x, startY: pt.y, startCrop: { ...crop } };
        return;
      }
    }

    if (!stage) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    setIsPanning(true);
    dragRef.current = {
      mode: 'pan',
      startX: e.clientX,
      startY: e.clientY,
      startCrop: crop,
      scrollLeft: stage.scrollLeft,
      scrollTop: stage.scrollTop,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;

    if (drag.mode === 'pan' && stageRef.current) {
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      stageRef.current.scrollLeft = (drag.scrollLeft ?? 0) - dx;
      stageRef.current.scrollTop = (drag.scrollTop ?? 0) - dy;
      return;
    }

    const pt = pointerToImage(e.clientX, e.clientY);
    if (!pt) return;

    if (drag.mode === 'draw' && drawingRef.current) {
      drawingRef.current.points.push(pt);
      setStrokes((prev) => {
        const next = [...prev];
        next[next.length - 1] = { ...drawingRef.current! };
        editStateRef.current = { ...editStateRef.current, strokes: next };
        return next;
      });
      return;
    }

    const dx = pt.x - drag.startX;
    const dy = pt.y - drag.startY;
    let { x, y, w, h } = drag.startCrop;
    const maxW = transformedSize.width;
    const maxH = transformedSize.height;
    const ratio =
      aspect === 'freeform'
        ? null
        : aspect === 'original'
          ? originalRatio
          : (ASPECT_RATIO_OPTIONS.find((o) => o.key === aspect)?.ratio ?? null);

    const applyRatioFromCorner = (nx: number, ny: number, nw: number, nh: number) => {
      if (!ratio) return { x: nx, y: ny, w: nw, h: nh };
      const nextH = nw / ratio;
      return { x: nx, y: ny, w: nw, h: nextH };
    };

    switch (drag.mode) {
      case 'move':
        x += dx;
        y += dy;
        break;
      case 'e':
        w = drag.startCrop.w + dx;
        if (ratio) h = w / ratio;
        break;
      case 'w': {
        const nextW = drag.startCrop.w - dx;
        x = drag.startCrop.x + dx;
        w = nextW;
        if (ratio) {
          h = w / ratio;
          y = drag.startCrop.y + (drag.startCrop.h - h) / 2;
        }
        break;
      }
      case 's':
        h = drag.startCrop.h + dy;
        if (ratio) w = h * ratio;
        break;
      case 'n': {
        const nextH = drag.startCrop.h - dy;
        y = drag.startCrop.y + dy;
        h = nextH;
        if (ratio) {
          w = h * ratio;
          x = drag.startCrop.x + (drag.startCrop.w - w) / 2;
        }
        break;
      }
      case 'se': {
        w = drag.startCrop.w + dx;
        h = drag.startCrop.h + dy;
        if (ratio) ({ x, y, w, h } = applyRatioFromCorner(drag.startCrop.x, drag.startCrop.y, w, w / ratio));
        break;
      }
      case 'nw': {
        w = drag.startCrop.w - dx;
        h = drag.startCrop.h - dy;
        x = drag.startCrop.x + dx;
        y = drag.startCrop.y + dy;
        if (ratio) {
          h = w / ratio;
          y = drag.startCrop.y + drag.startCrop.h - h;
          x = drag.startCrop.x + drag.startCrop.w - w;
        }
        break;
      }
      case 'ne': {
        w = drag.startCrop.w + dx;
        h = drag.startCrop.h - dy;
        y = drag.startCrop.y + dy;
        if (ratio) {
          h = w / ratio;
          y = drag.startCrop.y + drag.startCrop.h - h;
        }
        break;
      }
      case 'sw': {
        w = drag.startCrop.w - dx;
        h = drag.startCrop.h + dy;
        x = drag.startCrop.x + dx;
        if (ratio) {
          h = w / ratio;
        }
        break;
      }
      default:
        break;
    }

    const next = clampCrop({ x, y, w, h }, maxW, maxH);
    setCrop(next);
    setDirtyCrop(true);
    const nextOutW = openAccordion !== 'resize' ? Math.round(next.w) : outW;
    const nextOutH = openAccordion !== 'resize' ? Math.round(next.h) : outH;
    if (openAccordion !== 'resize') {
      setOutW(nextOutW);
      setOutH(nextOutH);
    }
    editStateRef.current = {
      ...editStateRef.current,
      crop: next,
      dirtyCrop: true,
      outW: nextOutW,
      outH: nextOutH,
    };
  };

  const onPointerUp = () => {
    const wasDragging = Boolean(dragRef.current);
    const wasPan = dragRef.current?.mode === 'pan';
    dragRef.current = null;
    drawingRef.current = null;
    setIsPanning(false);
    if (!wasDragging || wasPan) return;
    // Commit after the last move state has flushed into editStateRef.
    window.requestAnimationFrame(() => {
      pushHistory();
    });
  };

  const handleApplyCrop = () => {
    const snap: EditSnapshot = {
      ...editStateRef.current,
      outW: Math.round(crop.w),
      outH: Math.round(crop.h),
      dirtyCrop: false,
    };
    applySnapshot(snap);
    pushHistory(snap);
    toast.success('Crop applied');
  };

  const handleApplyResize = async () => {
    if (!source) return;
    const width = Number.parseInt(draftW, 10);
    const height = Number.parseInt(draftH, 10);
    if (!Number.isFinite(width) || width < 1 || !Number.isFinite(height) || height < 1) {
      const msg = 'Enter a valid width and height (at least 1px).';
      setSaveError(msg);
      toast.error(msg);
      return;
    }

    let tempObjectUrl: string | null = null;
    try {
      setApplyingResize(true);
      setSaveError(null);

      const bake = async (img: HTMLImageElement) =>
        canvasToImageElement(
          exportEditedImage({
            source: img,
            rotation,
            flipH,
            flipV,
            crop,
            outputWidth: width,
            outputHeight: height,
            strokes,
          })
        );

      let baked: { image: HTMLImageElement; objectUrl: string };
      try {
        // Prefer in-memory image — no network. Fixes intermittent "Failed to fetch".
        baked = await bake(source);
      } catch {
        const fallbackUrl =
          objectUrlRef.current ||
          (source.src.startsWith('blob:') || source.src.startsWith('data:')
            ? source.src
            : imageUrl);
        const exportable = await ensureExportableImage(source, fallbackUrl);
        tempObjectUrl = exportable.objectUrl;
        baked = await bake(exportable.image);
      }

      if (objectUrlRef.current && objectUrlRef.current !== baked.objectUrl) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      objectUrlRef.current = baked.objectUrl;
      setSource(baked.image);
      setNaturalW(width);
      setNaturalH(height);

      const nextCrop = fullCrop(width, height);
      const snap: EditSnapshot = {
        rotation: 0,
        flipH: false,
        flipV: false,
        aspect: 'original',
        crop: nextCrop,
        outW: width,
        outH: height,
        strokes: [],
        dirtyCrop: false,
      };
      applySnapshot(snap);
      pushHistory(snap);
      setDraftW(String(width));
      setDraftH(String(height));
      aspectLockRatioRef.current = height / width;
      toast.success(`Resized to ${width} × ${height}px`);
    } catch (err: unknown) {
      const raw = (err as Error)?.message || 'Could not apply resize';
      const msg =
        /failed to fetch/i.test(raw)
          ? 'Could not resize this image (network/CORS). Try uploading it to store Files first, then edit that copy.'
          : raw;
      setSaveError(msg);
      toast.error(msg);
    } finally {
      if (tempObjectUrl) URL.revokeObjectURL(tempObjectUrl);
      setApplyingResize(false);
    }
  };

  const parsedDraftW = Number.parseInt(draftW, 10);
  const parsedDraftH = Number.parseInt(draftH, 10);
  const resizeDirty =
    (Number.isFinite(parsedDraftW) && parsedDraftW !== naturalW) ||
    (Number.isFinite(parsedDraftH) && parsedDraftH !== naturalH) ||
    rotation !== 0 ||
    flipH ||
    flipV ||
    strokes.length > 0 ||
    Math.round(crop.w) !== naturalW ||
    Math.round(crop.h) !== naturalH;

  const updateDraftWidth = (raw: string) => {
    if (raw !== '' && !/^\d*$/.test(raw)) return;
    setDraftW(raw);
    if (!lockAspect || raw === '') return;
    const w = Number.parseInt(raw, 10);
    if (!Number.isFinite(w) || w < 1) return;
    const ratio = aspectLockRatioRef.current || crop.h / Math.max(1, crop.w);
    setDraftH(String(Math.max(1, Math.round(w * ratio))));
  };

  const updateDraftHeight = (raw: string) => {
    if (raw !== '' && !/^\d*$/.test(raw)) return;
    setDraftH(raw);
    if (!lockAspect || raw === '') return;
    const h = Number.parseInt(raw, 10);
    if (!Number.isFinite(h) || h < 1) return;
    const ratio = aspectLockRatioRef.current || crop.h / Math.max(1, crop.w);
    setDraftW(String(Math.max(1, Math.round(h / ratio))));
  };

  const toggleAspectLock = () => {
    setLockAspect((locked) => {
      const next = !locked;
      if (next) {
        const w = Number.parseInt(draftW, 10) || outW || crop.w || 1;
        const h = Number.parseInt(draftH, 10) || outH || crop.h || 1;
        aspectLockRatioRef.current = h / Math.max(1, w);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!source) {
      setSaveError('Image is still loading. Try again in a moment.');
      return;
    }
    if (!activeStoreId) {
      const msg = 'Select a store before saving the edited image';
      setSaveError(msg);
      toast.error(msg);
      return;
    }
    let tempObjectUrl: string | null = null;
    try {
      setSaving(true);
      setSaveError(null);

      const width = Math.max(1, Math.round(Number.parseInt(draftW, 10) || outW || crop.w));
      const height = Math.max(1, Math.round(Number.parseInt(draftH, 10) || outH || crop.h));

      const bakeCanvas = (img: HTMLImageElement) =>
        exportEditedImage({
          source: img,
          rotation,
          flipH,
          flipV,
          crop,
          outputWidth: width,
          outputHeight: height,
          strokes,
        });

      let canvas: HTMLCanvasElement;
      try {
        canvas = bakeCanvas(source);
        // Probe taint before upload work
        canvas.toDataURL('image/png');
      } catch {
        const fallbackUrl =
          objectUrlRef.current ||
          (source.src.startsWith('blob:') || source.src.startsWith('data:')
            ? source.src
            : imageUrl);
        const exportable = await ensureExportableImage(source, fallbackUrl);
        tempObjectUrl = exportable.objectUrl;
        canvas = bakeCanvas(exportable.image);
      }
      const file = await canvasToPngFile(canvas, fileName);
      const { objectUrl } = await uploadFileForStoreQuiet(activeStoreId, file, {
        folder: defaultContentFilesFolder(activeStoreId),
      });
      if (!objectUrl) throw new Error('Upload failed');
      onSaved(objectUrl);
      toast.success('Image saved to store files');
      onClose();
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Could not save edited image';
      setSaveError(msg);
      toast.error(msg);
    } finally {
      if (tempObjectUrl) URL.revokeObjectURL(tempObjectUrl);
      setSaving(false);
    }
  };

  const busy = loading || saving || applyingResize || imageUploadLoading;

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[16000] flex flex-col justify-end" role="presentation">
      <button
        type="button"
        className={`absolute inset-0 bg-black/55 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Close image editor"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-image-editor-title"
        className={`relative flex h-[min(94vh,920px)] w-full flex-col overflow-hidden rounded-t-2xl bg-[#0b0b0b] text-white shadow-2xl transition-transform duration-300 ease-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-center py-2">
          <span className="h-1 w-10 rounded-full bg-white/25" aria-hidden />
        </div>

        <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-4 pb-3">
          <h2 id="theme-image-editor-title" className="shrink-0 text-[15px] font-semibold">
            Edit image
          </h2>
          <span className="min-w-0 flex-1 truncate text-[12px] text-white/50">{fileName}</span>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              title="Undo (Ctrl+Z)"
              disabled={!canUndo || busy}
              onClick={undo}
              className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-medium text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowUturnLeftIcon className="h-4 w-4" />
              Undo
            </button>
            <button
              type="button"
              title="Redo (Ctrl+Y)"
              disabled={!canRedo || busy}
              onClick={redo}
              className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-medium text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowUturnRightIcon className="h-4 w-4" />
              Redo
            </button>
            <button
              type="button"
              title="Discard all changes"
              disabled={!canDiscard || busy}
              onClick={discard}
              className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-medium text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Discard
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div
            ref={stageRef}
            className="relative min-h-[280px] flex-1 overflow-auto overscroll-contain bg-[length:18px_18px] bg-[linear-gradient(45deg,#1a1a1a_25%,transparent_25%),linear-gradient(-45deg,#1a1a1a_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1a1a1a_75%),linear-gradient(-45deg,transparent_75%,#1a1a1a_75%)] bg-[position:0_0,0_9px,9px_-9px,-9px_0] select-none"
          >
            {loading ? (
              <div className="flex h-full min-h-[280px] items-center justify-center">
                <p className="text-sm text-white/60">Loading image…</p>
              </div>
            ) : error ? (
              <div className="flex h-full min-h-[280px] items-center justify-center p-4">
                <p className="max-w-sm text-center text-sm text-red-300">{error}</p>
              </div>
            ) : (
              <div
                className={`flex items-center justify-center p-4 ${
                  openAccordion === 'draw'
                    ? 'cursor-crosshair'
                    : isPanning
                      ? 'cursor-grabbing'
                      : 'cursor-grab'
                }`}
                style={{
                  minWidth: '100%',
                  minHeight: '100%',
                  width: Math.max(stageSize.w, viewLayout.displayW + 48),
                  height: Math.max(stageSize.h, viewLayout.displayH + 48),
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                <canvas
                  ref={canvasRef}
                  className="touch-none"
                  style={{
                    width: viewLayout.displayW,
                    height: viewLayout.displayH,
                  }}
                />
              </div>
            )}

            <div className="pointer-events-none sticky bottom-4 z-10 flex justify-center px-4 pb-1">
              <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/15 bg-black/70 px-4 py-2 backdrop-blur">
              <span className="w-10 text-center text-[11px] text-white/70">{Math.round(zoom * 100)}%</span>
              <input
                type="range"
                min={0.4}
                max={2.5}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="h-1 w-36 accent-white"
                aria-label="Zoom"
              />
              <button
                type="button"
                title="Fit (100%)"
                onClick={() => setZoom(1)}
                className="rounded p-1 text-white/70 hover:bg-white/10"
              >
                <ArrowsPointingOutIcon className="h-4 w-4" />
              </button>
              </div>
            </div>
          </div>

          <aside className="flex w-full shrink-0 flex-col border-t border-white/10 lg:w-[320px] lg:border-l lg:border-t-0">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <Accordion
                id="info"
                title="Information"
                icon={<InformationCircleIcon className="h-4 w-4" />}
                openId={openAccordion}
                onToggle={(id) => setOpenAccordion((cur) => (cur === id ? null : id))}
              >
                <dl className="space-y-2 text-[12px] text-white/70">
                  <div className="flex justify-between gap-3">
                    <dt>File</dt>
                    <dd className="truncate text-white">{fileName}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Original</dt>
                    <dd className="text-white">
                      {naturalW} × {naturalH}px
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Crop</dt>
                    <dd className="text-white">
                      {Math.round(crop.w)} × {Math.round(crop.h)}px
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Output</dt>
                    <dd className="text-white">
                      {outW} × {outH}px
                    </dd>
                  </div>
                </dl>
              </Accordion>

              <Accordion
                id="crop"
                title="Crop and transform"
                icon={<SparklesIcon className="h-4 w-4" />}
                openId={openAccordion}
                onToggle={(id) => setOpenAccordion((cur) => (cur === id ? null : id))}
              >
                <div className="mb-3 flex gap-2">
                  <button
                    type="button"
                    className={`flex-1 rounded-lg border px-2 py-2 text-[12px] ${
                      transformedSize.width >= transformedSize.height
                        ? 'border-white bg-white/10 text-white'
                        : 'border-white/20 text-white/60'
                    }`}
                    onClick={() => {
                      if (transformedSize.width < transformedSize.height) {
                        resetCropForTransform(normalizedRotationPlus(rotation, 90), aspect);
                      }
                    }}
                  >
                    Landscape
                  </button>
                  <button
                    type="button"
                    className={`flex-1 rounded-lg border px-2 py-2 text-[12px] ${
                      transformedSize.height > transformedSize.width
                        ? 'border-white bg-white/10 text-white'
                        : 'border-white/20 text-white/60'
                    }`}
                    onClick={() => {
                      if (transformedSize.height <= transformedSize.width) {
                        resetCropForTransform(normalizedRotationPlus(rotation, 90), aspect);
                      }
                    }}
                  >
                    Portrait
                  </button>
                </div>

                <div className="space-y-1">
                  {ASPECT_RATIO_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => applyAspect(opt.key)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[13px] ${
                        aspect === opt.key ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          aspect === opt.key ? 'border-white' : 'border-white/30'
                        }`}
                      >
                        {aspect === opt.key ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                      </span>
                      {opt.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={!dirtyCrop}
                  onClick={handleApplyCrop}
                  className="mt-3 w-full rounded-lg bg-white/15 px-3 py-2.5 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white/20"
                >
                  Apply
                </button>

                <div className="mt-3 grid grid-cols-4 gap-2">
                  <IconBtn
                    title="Flip horizontal"
                    onClick={() => {
                      const snap: EditSnapshot = {
                        ...editStateRef.current,
                        flipH: !editStateRef.current.flipH,
                        strokes: [],
                      };
                      applySnapshot(snap);
                      pushHistory(snap);
                    }}
                  >
                    <ArrowsRightLeftIcon className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn
                    title="Flip vertical"
                    onClick={() => {
                      const snap: EditSnapshot = {
                        ...editStateRef.current,
                        flipV: !editStateRef.current.flipV,
                        strokes: [],
                      };
                      applySnapshot(snap);
                      pushHistory(snap);
                    }}
                  >
                    <span className="inline-block rotate-90">
                      <ArrowsRightLeftIcon className="h-4 w-4" />
                    </span>
                  </IconBtn>
                  <IconBtn
                    title="Rotate left"
                    onClick={() => {
                      const next = normalizedRotationPlus(rotation, -90);
                      resetCropForTransform(next, aspect);
                    }}
                  >
                    <ArrowUturnLeftIcon className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn
                    title="Rotate right"
                    onClick={() => {
                      const next = normalizedRotationPlus(rotation, 90);
                      resetCropForTransform(next, aspect);
                    }}
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                  </IconBtn>
                </div>
              </Accordion>

              <Accordion
                id="resize"
                title="Resize"
                icon={<ArrowsPointingOutIcon className="h-4 w-4" />}
                openId={openAccordion}
                onToggle={(id) => setOpenAccordion((cur) => (cur === id ? null : id))}
              >
                <div className="flex items-center gap-2">
                  <label className="flex min-w-0 flex-1 items-center rounded-lg border border-white/20 bg-black/40 focus-within:border-white/50">
                    <span className="shrink-0 px-2.5 text-[12px] font-medium text-white/50">W</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={draftW}
                      onChange={(e) => updateDraftWidth(e.target.value)}
                      placeholder="—"
                      className="min-w-0 flex-1 bg-transparent py-2 text-[13px] text-white outline-none"
                      aria-label="Width in pixels"
                    />
                    <span className="shrink-0 px-2.5 text-[12px] text-white/45">px</span>
                  </label>

                  <button
                    type="button"
                    title={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
                    onClick={toggleAspectLock}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                      lockAspect
                        ? 'border-white/40 bg-white/10 text-white'
                        : 'border-white/20 text-white/55 hover:bg-white/5'
                    }`}
                  >
                    {lockAspect ? (
                      <LockClosedIcon className="h-4 w-4" />
                    ) : (
                      <LockOpenIcon className="h-4 w-4" />
                    )}
                  </button>

                  <label className="flex min-w-0 flex-1 items-center rounded-lg border border-white/20 bg-black/40 focus-within:border-white/50">
                    <span className="shrink-0 px-2.5 text-[12px] font-medium text-white/50">H</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={draftH}
                      onChange={(e) => updateDraftHeight(e.target.value)}
                      placeholder="—"
                      className="min-w-0 flex-1 bg-transparent py-2 text-[13px] text-white outline-none"
                      aria-label="Height in pixels"
                    />
                    <span className="shrink-0 px-2.5 text-[12px] text-white/45">px</span>
                  </label>
                </div>

                <p className="mt-2 text-[11px] text-white/45">
                  Current image: {naturalW} × {naturalH}px
                </p>
                <button
                  type="button"
                  disabled={!resizeDirty || applyingResize || !source || !draftW || !draftH}
                  onClick={() => void handleApplyResize()}
                  className="mt-3 w-full rounded-lg bg-white/15 px-3 py-2.5 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white/20"
                >
                  {applyingResize ? 'Applying…' : 'Apply'}
                </button>
                <button
                  type="button"
                  className="mt-2 w-full rounded-lg border border-white/20 px-3 py-2 text-[12px] text-white/80 hover:bg-white/5"
                  onClick={() => {
                    const w = Math.round(crop.w);
                    const h = Math.round(crop.h);
                    setDraftW(String(w));
                    setDraftH(String(h));
                    setOutW(w);
                    setOutH(h);
                    aspectLockRatioRef.current = h / Math.max(1, w);
                    editStateRef.current = {
                      ...editStateRef.current,
                      outW: w,
                      outH: h,
                    };
                  }}
                >
                  Reset to crop size
                </button>
              </Accordion>

              <Accordion
                id="draw"
                title="Draw"
                icon={<PencilIcon className="h-4 w-4" />}
                openId={openAccordion}
                onToggle={(id) => setOpenAccordion((cur) => (cur === id ? null : id))}
              >
                <p className="mb-3 text-[12px] text-white/50">
                  Open Draw, then sketch on the image. Strokes export with your crop.
                </p>
                <div className="mb-3 flex flex-wrap gap-2">
                  {DRAW_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      onClick={() => setDrawColor(c)}
                      className={`h-7 w-7 rounded-full border-2 ${
                        drawColor === c ? 'border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <label className="block space-y-1 text-[12px] text-white/60">
                  Brush size ({drawSize}px)
                  <input
                    type="range"
                    min={2}
                    max={36}
                    value={drawSize}
                    onChange={(e) => setDrawSize(Number(e.target.value))}
                    className="w-full accent-white"
                  />
                </label>
                <button
                  type="button"
                  className="mt-3 w-full rounded-lg border border-white/20 px-3 py-2 text-[12px] text-white/80 hover:bg-white/5"
                  onClick={() => {
                    const snap: EditSnapshot = {
                      ...editStateRef.current,
                      strokes: [],
                    };
                    applySnapshot(snap);
                    pushHistory(snap);
                  }}
                  disabled={!strokes.length}
                >
                  Clear drawings
                </button>
              </Accordion>
            </div>

            <div className="shrink-0 border-t border-white/10 p-4">
              {saveError ? (
                <p className="mb-3 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-[12px] leading-snug text-red-200">
                  {saveError}
                </p>
              ) : null}
              <button
                type="button"
                disabled={!source || busy || Boolean(error)}
                onClick={() => void handleSave()}
                className="w-full rounded-lg bg-white px-3 py-2.5 text-[13px] font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white/90"
              >
                {saving || imageUploadLoading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>,
    document.body
  );
}

function normalizedRotationPlus(current: number, delta: number): number {
  return ((current + delta) % 360 + 360) % 360;
}

function IconBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-10 items-center justify-center rounded-lg border border-white/20 text-white/80 hover:bg-white/10"
    >
      {children}
    </button>
  );
}
