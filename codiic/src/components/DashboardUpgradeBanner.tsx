import { XMarkIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Dismissible promo strip — Shopify-style surface on gray canvas.
 */
export default function DashboardUpgradeBanner() {
  const [open, setOpen] = useState(true);

  const dismiss = useCallback(() => setOpen(false), []);

  if (!open) return null;

  return (
    <div className="relative flex flex-col gap-3 rounded-xl border border-admin-border bg-admin-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-admin-secondary">
          <SparklesIcon className="h-4 w-4 text-admin-text-secondary" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-admin-text">
            Upgrade your plan to unlock advanced features
          </p>
          <p className="mt-0.5 text-[12px] text-admin-text-secondary">
            More automation, reporting, and growth tools when you&apos;re ready.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 pl-[48px] sm:pl-0">
        <Link
          to="/settings/plan"
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#005bd3] hover:underline"
        >
          Select plan
          <span aria-hidden>→</span>
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg p-1.5 text-admin-text-subdued transition-colors hover:bg-admin-row-hover hover:text-admin-text"
          aria-label="Dismiss"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
