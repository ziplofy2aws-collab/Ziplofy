import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { sanitizeProductDescriptionHtml } from '../../../utils/product-description-html.util';

type Props = {
  open: boolean;
  title: string;
  loading?: boolean;
  error?: string | null;
  content?: string | null;
  onClose: () => void;
};

const POLICY_HTML_CLASS =
  'checkout-policy-html text-[14px] leading-7 text-[#121212] [&_a]:text-[#1773b0] [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-[#dedede] [&_blockquote]:pl-3 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6';

export function CheckoutPolicyModal({ open, title, loading = false, error = null, content, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open || !mounted) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, mounted]);

  if (!open || !mounted) return null;

  const portalRoot = document.getElementById('modal-root') ?? document.body;
  const safeHtml = content ? sanitizeProductDescriptionHtml(content) : '';

  return createPortal(
    <div
      className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative flex max-h-[min(88vh,720px)] w-full max-w-[560px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-policy-modal-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#e1e3e5] px-5 py-4">
          <h2 id="checkout-policy-modal-title" className="text-[16px] font-semibold text-[#121212]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[#707070] transition-colors hover:bg-[#f1f1f1] hover:text-[#121212]"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <p className="text-sm text-[#707070]">Loading policy…</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : safeHtml ? (
            <div className={POLICY_HTML_CLASS} dangerouslySetInnerHTML={{ __html: safeHtml }} />
          ) : (
            <p className="text-sm text-[#707070]">This policy hasn&apos;t been published yet.</p>
          )}
        </div>
      </div>
    </div>,
    portalRoot
  );
}
