'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { FlowButton, FlowButtonLoading } from '@/components/ui/flow-button';
import { hideBusy, showBusy } from '@/stores/busyStore';

/** Previous workspace glass shell — used by all create/edit dialogs. */
export const appModalGlassPanel =
  'overflow-hidden rounded-[28px] border border-white/70 bg-white/45 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-2xl';

export const appModalFieldClass =
  'mt-1.5 w-full rounded-2xl border border-white/80 bg-white/75 px-3.5 py-3 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus:border-emerald-400/70 focus:bg-white/90 focus:ring-4 focus:ring-emerald-500/15 disabled:opacity-60';

export const appModalLabelClass = 'block text-[13px] font-semibold text-slate-800';

type AppFormModalProps = {
  open: boolean;
  title: string;
  eyebrow?: string;
  description?: string;
  onClose: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  confirmLabel: string;
  confirmLoadingLabel?: string;
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
  asForm?: boolean;
  zIndexClass?: string;
};

export default function AppFormModal({
  open,
  title,
  eyebrow = 'New',
  description,
  onClose,
  onSubmit,
  confirmLabel,
  confirmLoadingLabel = 'Saving…',
  loading = false,
  error,
  children,
  asForm = true,
  zIndexClass = 'z-[1400]',
}: AppFormModalProps) {
  const held = useRef(false);

  const holdBusy = () => {
    if (held.current) return;
    held.current = true;
    showBusy(confirmLoadingLabel);
  };

  const releaseBusy = () => {
    if (!held.current) return;
    held.current = false;
    hideBusy();
  };

  useEffect(() => {
    if (!open) {
      releaseBusy();
      return;
    }
    if (loading) holdBusy();
    else releaseBusy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loading, confirmLoadingLabel]);

  if (!open) return null;

  const titleId = `app-form-modal-${title.replace(/\s+/g, '-').toLowerCase()}`;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800/75">
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={titleId}
            className={`text-[18px] font-semibold tracking-tight text-slate-900 ${eyebrow ? 'mt-1' : ''}`}
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{description}</p>
          ) : null}
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          className="rounded-xl border border-white/80 bg-white/55 p-2 text-slate-500 transition hover:bg-white/80 hover:text-slate-800 disabled:opacity-50"
          aria-label="Close"
          data-no-busy="1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {children}
        {error ? <p className="text-[12px] text-red-600">{error}</p> : null}
      </div>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        <FlowButton
          type="button"
          text="Cancel"
          className="sm:w-auto sm:min-w-[120px]"
          disabled={loading}
          onClick={onClose}
          data-no-busy="1"
        />
        {loading ? (
          <FlowButtonLoading text={confirmLoadingLabel} className="sm:w-auto sm:min-w-[190px]" />
        ) : (
          <FlowButton
            type={asForm ? 'submit' : 'button'}
            text={confirmLabel}
            className="sm:w-auto sm:min-w-[190px]"
            onClick={
              asForm
                ? undefined
                : onSubmit
                  ? () => onSubmit({} as React.FormEvent)
                  : undefined
            }
          />
        )}
      </div>
    </>
  );

  return (
    <div className={`fixed inset-0 ${zIndexClass} flex items-center justify-center p-4`}>
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-900/25 backdrop-blur-[3px]"
        disabled={loading}
        onClick={onClose}
        data-no-busy="1"
      />
      {asForm ? (
        <form
          onSubmit={onSubmit}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`relative ${appModalGlassPanel} w-full max-w-md space-y-1 px-5 py-6 sm:px-7 sm:py-7`}
        >
          {body}
        </form>
      ) : (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`relative ${appModalGlassPanel} w-full max-w-md space-y-1 px-5 py-6 sm:px-7 sm:py-7`}
        >
          {body}
        </div>
      )}
    </div>
  );
}
