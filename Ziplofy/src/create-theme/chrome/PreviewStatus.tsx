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

/** @deprecated Replaced by {@link PreviewSyncProgressBar} on the create-theme preview canvas. */
export function PreviewSyncPulse({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return null;
}

type PreviewSyncProgressBarProps = {
  runKey: number;
  onComplete: () => void;
};

/** Thin light-grey progress line below the editor header; runs left→right, then `onComplete`. */
export function PreviewSyncProgressBar({ runKey, onComplete }: PreviewSyncProgressBarProps) {
  if (runKey < 1) return null;

  return (
    <div className="preview-sync-progress-track" aria-live="polite" aria-label="Updating preview">
      <div
        key={runKey}
        className="preview-sync-progress-bar"
        onAnimationEnd={onComplete}
      />
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
