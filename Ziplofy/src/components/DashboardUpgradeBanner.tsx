import { XMarkIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Dismissible promo strip — matches reference “upgrade plan” banner styling.
 */
export default function DashboardUpgradeBanner() {
  const [open, setOpen] = useState(true);

  const dismiss = useCallback(() => setOpen(false), []);

  if (!open) return null;

  return (
    <div className="relative flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-slate-100/80 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80">
          <SparklesIcon className="h-5 w-5 text-amber-500" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">Upgrade your plan to unlock advanced features</p>
          <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
            More automation, reporting, and growth tools when you&apos;re ready.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 pl-[52px] sm:pl-0">
        <Link
          to="/settings/plan"
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Select plan
          <span aria-hidden>→</span>
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/80 hover:text-slate-800"
          aria-label="Dismiss"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
