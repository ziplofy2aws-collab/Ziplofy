'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import {
  adminListFooterLinkClass,
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from '@/components/admin-list-ui';

const btnGhost = adminListSecondaryButtonClass;
const btnPrimary = adminListPrimaryButtonClass;
const btnPrimaryMuted =
  'inline-flex cursor-not-allowed items-center justify-center rounded-lg bg-admin-fill px-3 py-1.5 text-[13px] font-semibold text-admin-text-subdued';
const btnTemplate = `${adminListSecondaryButtonClass} px-3 py-2 text-xs`;
const modalNoticeBox = 'mb-4 rounded-xl border border-admin-border bg-admin-surface p-4';
const modalDisclaimerBox =
  'mt-3 rounded-lg border border-admin-border bg-admin-fill p-3 text-admin-text-secondary';
const modalLinkClass = `${adminListFooterLinkClass} font-medium underline decoration-[#005bd3]/30 underline-offset-2`;

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  actions: ReactNode;
  notice?: ReactNode;
  topBanner?: ReactNode;
  showInsertTemplate?: boolean;
  onInsertTemplate?: () => void;
  disclaimerExpanded?: boolean;
  onToggleDisclaimer?: () => void;
  children: ReactNode;
};

export function PolicyEditorModal({
  open,
  title,
  onClose,
  actions,
  notice,
  topBanner,
  showInsertTemplate = true,
  onInsertTemplate,
  disclaimerExpanded = false,
  onToggleDisclaimer,
  children,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_16px_48px_rgba(16,24,40,0.18)]">
        <div className="flex items-center justify-between border-b border-admin-border px-5 py-3.5">
          <h3 className="text-[16px] font-semibold tracking-tight text-admin-text">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {topBanner}
          {notice ?? (
            <div className={modalNoticeBox}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm leading-relaxed text-admin-text-secondary">
                  Templates aren&apos;t legal advice. By using policy templates, you agree that you&apos;ve read and
                  agree to the{' '}
                  {onToggleDisclaimer ? (
                    <button type="button" className={modalLinkClass} onClick={onToggleDisclaimer}>
                      disclaimer {disclaimerExpanded ? '▾' : '▸'}
                    </button>
                  ) : (
                    'disclaimer'
                  )}
                </p>
                {showInsertTemplate && onInsertTemplate ? (
                  <button type="button" className={`${btnTemplate} shrink-0`} onClick={onInsertTemplate}>
                    Insert template
                  </button>
                ) : null}
              </div>
              {disclaimerExpanded ? (
                <div className={modalDisclaimerBox}>
                  <h3 className="mb-2 text-xs font-semibold text-admin-text">Generated policies disclaimer</h3>
                  <p className="mb-2 text-xs leading-relaxed">
                    The materials below are for informational purposes only and do not constitute advertising, a
                    solicitation or legal advice. Automated translations from the original English versions are available
                    for convenience only.
                  </p>
                  <p className="mb-2 text-xs leading-relaxed">
                    You should consult independent legal advice in all regions where these materials will be used before
                    publishing them. You are solely responsible for verifying the accuracy of all content and should
                    read the generated information with care and modify, delete or add all and any areas as necessary.
                  </p>
                  <p className="text-xs leading-relaxed">
                    You should not rely upon this information for any purpose without seeking legal advice from a
                    licensed attorney in the relevant regions.
                  </p>
                </div>
              ) : null}
            </div>
          )}
          {children}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-admin-border px-5 py-3.5">{actions}</div>
      </div>
    </div>,
    document.body
  );
}

export { btnGhost, btnPrimary, btnPrimaryMuted };
