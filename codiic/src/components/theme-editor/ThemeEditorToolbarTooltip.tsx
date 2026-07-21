import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  label: string;
  children: React.ReactNode;
};

export function ThemeEditorToolbarTooltip({ label, children }: Props) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const anchorRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      top: rect.top - 6,
      left: rect.left + rect.width / 2,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!visible) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [visible, updatePosition]);

  const tooltip =
    visible && typeof document !== 'undefined'
      ? createPortal(
          <div
            role="tooltip"
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              transform: 'translate(-50%, -100%)',
              zIndex: 10070,
            }}
            className="pointer-events-none whitespace-nowrap rounded-lg border border-[#e1e1e1] bg-white px-2.5 py-1.5 text-[12px] font-medium text-gray-800 shadow-md"
          >
            {label}
            <span
              aria-hidden
              className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-white"
              style={{ filter: 'drop-shadow(0 1px 0 #e1e1e1)' }}
            />
          </div>,
          document.body
        )
      : null;

  return (
    <div
      ref={anchorRef}
      className="inline-flex"
      onMouseEnter={() => {
        updatePosition();
        setVisible(true);
      }}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {tooltip}
    </div>
  );
}
