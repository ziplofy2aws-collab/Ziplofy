import React from 'react';

export function PreviewLoadingOverlay({ origin }: { origin?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/90 backdrop-blur-[2px]">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900"
        role="status"
        aria-label="Loading preview"
      />
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">Loading live preview</p>
        {origin ? <p className="mt-0.5 text-xs text-gray-400">{origin}</p> : null}
      </div>
    </div>
  );
}

export function PreviewSyncPulse({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      className="pointer-events-none absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/95 px-2.5 py-1 text-[11px] font-medium text-gray-600 shadow-sm transition-opacity duration-200"
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#005bd3] opacity-40" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#005bd3]" />
      </span>
      Updating preview
    </div>
  );
}

export function EditorBlockingOverlay({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[#1e1e1e]/40 backdrop-blur-[1px]">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-white"
        role="status"
        aria-label={label}
      />
      <p className="text-sm font-medium text-white">{label}</p>
    </div>
  );
}
