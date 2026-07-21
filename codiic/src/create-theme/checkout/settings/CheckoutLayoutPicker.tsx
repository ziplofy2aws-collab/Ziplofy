import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CHECKOUT_LAYOUT_OPTIONS,
  type CheckoutLayoutType,
} from './checkout-settings.types';

type Props = {
  layout: CheckoutLayoutType;
  onLayoutChange: (layout: CheckoutLayoutType) => void;
};

function OnePageLayoutIllustration() {
  return (
    <svg className="h-16 w-full" viewBox="0 0 200 80" fill="none" aria-hidden>
      <rect x="8" y="8" width="184" height="64" rx="4" stroke="#d2d5d8" strokeWidth="1.5" fill="#f6f6f7" />
      <rect x="16" y="16" width="96" height="48" rx="2" fill="#fff" stroke="#d2d5d8" />
      <rect x="22" y="22" width="56" height="4" rx="1" fill="#e3e5e7" />
      <rect x="22" y="30" width="72" height="4" rx="1" fill="#e3e5e7" />
      <rect x="22" y="38" width="64" height="4" rx="1" fill="#e3e5e7" />
      <rect x="22" y="52" width="40" height="8" rx="2" fill="#005bd3" />
      <rect x="120" y="16" width="64" height="48" rx="2" fill="#fff" stroke="#d2d5d8" />
      <rect x="128" y="24" width="48" height="4" rx="1" fill="#e3e5e7" />
      <rect x="128" y="32" width="40" height="4" rx="1" fill="#e3e5e7" />
    </svg>
  );
}

function ThreePageLayoutIllustration() {
  return (
    <svg className="h-16 w-full" viewBox="0 0 200 80" fill="none" aria-hidden>
      <rect x="24" y="20" width="152" height="52" rx="4" stroke="#d2d5d8" strokeWidth="1.5" fill="#f6f6f7" opacity="0.7" />
      <rect x="16" y="12" width="152" height="52" rx="4" stroke="#d2d5d8" strokeWidth="1.5" fill="#f6f6f7" opacity="0.85" />
      <rect x="8" y="4" width="152" height="52" rx="4" stroke="#d2d5d8" strokeWidth="1.5" fill="#fff" />
      <rect x="16" y="12" width="80" height="4" rx="1" fill="#e3e5e7" />
      <rect x="16" y="20" width="96" height="4" rx="1" fill="#e3e5e7" />
      <rect x="16" y="36" width="48" height="8" rx="2" fill="#005bd3" />
    </svg>
  );
}

function LayoutThumbnail({ layout }: { layout: CheckoutLayoutType }) {
  if (layout === 'three_page') {
    return (
      <svg className="h-10 w-14 shrink-0 rounded border border-[#c9cccf] bg-white" viewBox="0 0 56 40" aria-hidden>
        <rect x="10" y="6" width="36" height="28" rx="2" fill="#f6f6f7" stroke="#d2d5d8" />
        <rect x="6" y="10" width="36" height="28" rx="2" fill="#fafafa" stroke="#d2d5d8" />
        <rect x="14" y="14" width="28" height="20" rx="1" fill="#fff" stroke="#d2d5d8" />
      </svg>
    );
  }
  return (
    <svg className="h-10 w-14 shrink-0 rounded border border-[#c9cccf] bg-white" viewBox="0 0 56 40" aria-hidden>
      <rect x="4" y="4" width="48" height="32" rx="2" fill="#f6f6f7" stroke="#d2d5d8" strokeWidth="1" />
      <rect x="8" y="8" width="18" height="24" rx="1" fill="#ffffff" stroke="#d2d5d8" strokeWidth="1" />
      <rect x="30" y="8" width="18" height="10" rx="1" fill="#ffffff" stroke="#d2d5d8" strokeWidth="1" />
      <rect x="30" y="22" width="18" height="10" rx="1" fill="#e3e5e7" stroke="#d2d5d8" strokeWidth="1" />
    </svg>
  );
}

export function CheckoutLayoutPicker({ layout, onLayoutChange }: Props) {
  const [open, setOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);

  const layoutLabel =
    CHECKOUT_LAYOUT_OPTIONS.find((option) => option.value === layout)?.label ?? 'One-page';

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setPopoverStyle({
      position: 'fixed',
      top: rect.top,
      left: rect.right + 8,
      zIndex: 1400,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open, updatePosition]);

  const selectLayout = (value: CheckoutLayoutType) => {
    onLayoutChange(value);
    setOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="flex w-full items-center gap-3 rounded-lg border border-[#c9cccf] bg-[#f6f6f7] px-3 py-2.5 text-left transition-colors hover:bg-[#ededed]"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <LayoutThumbnail layout={layout} />
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-900">
          {layoutLabel}
        </span>
        <svg className="h-4 w-4 shrink-0 text-gray-500" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open
        ? createPortal(
            <>
              <button
                type="button"
                className="fixed inset-0 z-[1390] cursor-default bg-transparent"
                aria-label="Close layout picker"
                onClick={() => setOpen(false)}
              />
              <div
                style={popoverStyle}
                className="w-[min(320px,calc(100vw-24px))] rounded-xl border border-[#e1e3e5] bg-white p-3 shadow-xl"
                role="dialog"
                aria-label="Checkout layout"
              >
                <div className="space-y-3">
                  {CHECKOUT_LAYOUT_OPTIONS.map((option) => {
                    const selected = layout === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => selectLayout(option.value)}
                        className={`w-full rounded-xl border p-3 text-left transition-colors ${
                          selected
                            ? 'border-[#005bd3] bg-[#f4f8ff]'
                            : 'border-[#e1e3e5] bg-white hover:bg-[#fafafa]'
                        }`}
                      >
                        {option.value === 'one_page' ? (
                          <OnePageLayoutIllustration />
                        ) : (
                          <ThreePageLayoutIllustration />
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <p className="text-[13px] font-semibold text-gray-900">{option.title}</p>
                          {option.recommended ? (
                            <span className="rounded-full bg-[#d4e3ff] px-2 py-0.5 text-[11px] font-medium text-[#005bd3]">
                              Recommended
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-[12px] leading-relaxed text-gray-600">
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>,
            document.body
          )
        : null}
    </>
  );
}
