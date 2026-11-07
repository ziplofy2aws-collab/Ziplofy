'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { getLoadingAnimationData } from '@/lib/loadingAnimation';
import { useBusyStore } from '@/stores/busyStore';

type ActionBusyOverlayProps = {
  /** Optional local override; global busyStore also drives this overlay. */
  open?: boolean;
  label?: string;
  zIndexClass?: string;
};

/** Full-screen busy veil — loader only, light blur, no card. Mobile-safe cover. */
export default function ActionBusyOverlay({
  open: openProp,
  label: labelProp,
  zIndexClass = 'z-[99999]',
}: ActionBusyOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const count = useBusyStore((s) => s.count);
  const storeLabel = useBusyStore((s) => s.label);
  const data = useMemo(() => getLoadingAnimationData(), []);

  const open = Boolean(openProp) || count > 0;
  const label = labelProp || storeLabel || 'Loading';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className={`fixed inset-0 ${zIndexClass} flex flex-col items-center justify-center overscroll-none`}
      role="status"
      aria-live="assertive"
      aria-busy="true"
      aria-label={label}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        minHeight: '100dvh',
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        paddingRight: 'max(12px, env(safe-area-inset-right))',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        paddingLeft: 'max(12px, env(safe-area-inset-left))',
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
      }}
    >
      <div
        className="absolute inset-0 bg-white/40 backdrop-blur-[3px]"
        style={{ WebkitBackdropFilter: 'blur(3px)' }}
        aria-hidden
      />
      <div className="relative h-32 w-32 sm:h-44 sm:w-44">
        <DotLottieReact
          data={data}
          loop
          autoplay
          speed={0.55}
          className="h-full w-full"
          style={{ width: '100%', height: '100%' }}
          layout={{ fit: 'contain', align: [0.5, 0.5] }}
        />
      </div>
    </div>,
    document.body
  );
}
