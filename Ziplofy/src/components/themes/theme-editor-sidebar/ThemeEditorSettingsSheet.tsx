import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'ziplofy-theme-editor-settings-sheet-height';
const MIN_HEIGHT = 180;
const DEFAULT_HEIGHT = 420;

type ThemeEditorSettingsSheetProps = {
  children: ReactNode;
};

function readStoredHeight(): number {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const n = raw ? Number(raw) : NaN;
    if (Number.isFinite(n) && n >= MIN_HEIGHT) return n;
  } catch {
    /* ignore */
  }
  return DEFAULT_HEIGHT;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Bottom settings panel with drag-to-resize (up to nearly full sidebar height). */
export function ThemeEditorSettingsSheet({ children }: ThemeEditorSettingsSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef(readStoredHeight());
  const [height, setHeight] = useState(heightRef.current);
  const dragRef = useRef<{ startY: number; startH: number } | null>(null);

  const getBounds = useCallback(() => {
    const aside = sheetRef.current?.closest('aside');
    const asideH = aside?.clientHeight ?? 720;
    const max = Math.max(MIN_HEIGHT, asideH - 52);
    const defaultH = Math.min(DEFAULT_HEIGHT, max);
    return { min: MIN_HEIGHT, max, default: defaultH };
  }, []);

  const persistHeight = useCallback((value: number) => {
    heightRef.current = value;
    try {
      sessionStorage.setItem(STORAGE_KEY, String(Math.round(value)));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onResize = () => {
      const { max } = getBounds();
      setHeight((h) => {
        const next = clamp(h, MIN_HEIGHT, max);
        if (next !== h) persistHeight(next);
        return next;
      });
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, [getBounds, persistHeight]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startH: heightRef.current };
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ns-resize';
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    persistHeight(heightRef.current);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const { min, max } = getBounds();
    const delta = dragRef.current.startY - e.clientY;
    const next = clamp(dragRef.current.startH + delta, min, max);
    heightRef.current = next;
    setHeight(next);
  };

  const onDoubleClick = () => {
    const { max, default: defaultH } = getBounds();
    const nearMax = heightRef.current >= max - 32;
    const next = nearMax ? defaultH : max;
    heightRef.current = next;
    setHeight(next);
    persistHeight(next);
  };

  return (
    <div
      ref={sheetRef}
      className="theme-editor-settings-sheet absolute inset-x-0 bottom-0 z-10 flex flex-col overflow-hidden border-t border-[#e1e1e1] bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)]"
      style={{ height }}
    >
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Drag to resize settings panel. Double-click for full height."
        aria-valuenow={Math.round(height)}
        aria-valuemin={MIN_HEIGHT}
        aria-valuemax={getBounds().max}
        className="flex shrink-0 cursor-ns-resize touch-none select-none items-center justify-center border-b border-[#e1e1e1] bg-[#f6f6f7] py-2.5"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={onDoubleClick}
      >
        <div className="h-1 w-10 rounded-full bg-[#aeb4b9]" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
