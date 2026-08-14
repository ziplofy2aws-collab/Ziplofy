import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  computeFloatingPopoverPosition,
  getFloatingPopoverRoot,
} from '../orders/floating-popover.util';

export type AnalyticsHint = {
  how: string;
  interpret: string;
};

const POPOVER_WIDTH = 300;
const POPOVER_GAP = 8;

export function AnalyticsInfoLabel({
  label,
  hint,
  dotted = true,
  className = '',
}: {
  label: string;
  hint: AnalyticsHint;
  dotted?: boolean;
  className?: string;
}) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const hideTimer = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = useCallback(() => {
    const anchor = triggerRef.current?.getBoundingClientRect();
    if (!anchor) return;
    const next = computeFloatingPopoverPosition(anchor, POPOVER_WIDTH, POPOVER_GAP, 80);
    setPosition({ top: next.top, left: next.left });
  }, []);

  const show = useCallback(() => {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    updatePosition();
    setOpen(true);
  }, [updatePosition]);

  const hide = useCallback(() => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setOpen(false), 80);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onReposition = () => updatePosition();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, updatePosition]);

  useEffect(
    () => () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    },
    [],
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`inline max-w-full cursor-help text-left ${className}`.trim()}
        aria-describedby={open ? id : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <span
          className={
            dotted
              ? 'border-b border-dotted border-admin-text-subdued pb-px'
              : undefined
          }
        >
          {label}
        </span>
      </button>
      {open && position
        ? createPortal(
            <div
              id={id}
              role="tooltip"
              className="pointer-events-none fixed z-50 w-[300px] rounded-lg border border-admin-border bg-admin-surface p-3 text-left shadow-lg"
              style={{ top: position.top, left: position.left }}
              onMouseEnter={show}
              onMouseLeave={hide}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-admin-text-subdued">
                How it’s calculated
              </p>
              <p className="mt-1 text-[12px] leading-5 text-admin-text">{hint.how}</p>
              <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-wide text-admin-text-subdued">
                How to read it
              </p>
              <p className="mt-1 text-[12px] leading-5 text-admin-text">{hint.interpret}</p>
            </div>,
            getFloatingPopoverRoot(),
          )
        : null}
    </>
  );
}
