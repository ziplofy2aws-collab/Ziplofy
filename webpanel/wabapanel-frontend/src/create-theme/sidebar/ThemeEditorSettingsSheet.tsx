import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

const MIN_HEIGHT = 180;
/** Initial guess before the sidebar is measured; the mount effect expands to full height. */
const DEFAULT_HEIGHT = 640;

type ThemeEditorSettingsSheetProps = {
  children: ReactNode;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Bottom settings panel; opens fully expanded and supports drag-to-resize. */
export function ThemeEditorSettingsSheet({ children }: ThemeEditorSettingsSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef(DEFAULT_HEIGHT);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const dragRef = useRef<{ startY: number; startH: number } | null>(null);

  const getBounds = useCallback(() => {
    const aside = sheetRef.current?.closest('aside');
    const asideH = aside?.clientHeight ?? 720;
    const max = Math.max(MIN_HEIGHT, asideH - 52);
    return { min: MIN_HEIGHT, max, default: max };
  }, []);

  const setHeightValue = useCallback((value: number) => {
    heightRef.current = value;
    setHeight(value);
  }, []);

  // Open fully expanded once the sidebar height is known, and keep it pinned to
  // full height on resize unless the user has dragged it smaller this session.
  const userResizedRef = useRef(false);
  useEffect(() => {
    const onResize = () => {
      const { max } = getBounds();
      setHeight((h) => {
        const next = userResizedRef.current ? clamp(h, MIN_HEIGHT, max) : max;
        heightRef.current = next;
        return next;
      });
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, [getBounds]);

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
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const { min, max } = getBounds();
    const delta = dragRef.current.startY - e.clientY;
    const next = clamp(dragRef.current.startH + delta, min, max);
    userResizedRef.current = next < max - 4;
    setHeightValue(next);
  };

  const onDoubleClick = () => {
    const { max, default: defaultH } = getBounds();
    const nearMax = heightRef.current >= max - 32;
    const next = nearMax ? Math.min(defaultH, max) : max;
    userResizedRef.current = next < max - 4;
    setHeightValue(next);
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
