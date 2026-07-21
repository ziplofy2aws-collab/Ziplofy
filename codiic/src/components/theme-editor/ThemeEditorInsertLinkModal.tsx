import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowTopRightOnSquareIcon, LinkIcon, TagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ThemeEditorLinkPickerDropdown } from './ThemeEditorLinkPicker';
import { isValidThemeEditorLinkHref } from './theme-editor-link.util';

export type InsertLinkResult = {
  text: string;
  href: string;
  openInNewTab: boolean;
};

type Props = {
  open: boolean;
  initialText: string;
  initialHref: string;
  initialOpenInNewTab: boolean;
  onClose: () => void;
  onInsert: (result: InsertLinkResult) => void;
};

export function ThemeEditorInsertLinkModal({
  open,
  initialText,
  initialHref,
  initialOpenInNewTab,
  onClose,
  onInsert,
}: Props) {
  const [text, setText] = useState('');
  const [href, setHref] = useState('');
  const [linkLabel, setLinkLabel] = useState<string | null>(null);
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const hrefInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setText(initialText);
    setHref(initialHref);
    setLinkLabel(null);
    setOpenInNewTab(initialOpenInNewTab);
    setPickerOpen(false);
  }, [open, initialText, initialHref, initialOpenInNewTab]);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      hrefInputRef.current?.focus();
      setPickerOpen(true);
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const canInsert = useMemo(
    () => isValidThemeEditorLinkHref(href) && text.trim().length > 0,
    [href, text]
  );

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10060] flex items-center justify-center bg-black/25 p-4"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-insert-link-title"
        className="flex w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/10"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#e1e1e1] px-4 py-3">
          <h2 id="theme-insert-link-title" className="text-[15px] font-semibold text-gray-900">
            Insert link
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-visible px-4 py-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="insert-link-text" className="mb-1.5 block text-[13px] font-medium text-gray-800">
                Text
              </label>
              <input
                id="insert-link-text"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label htmlFor="insert-link-href" className="text-[13px] font-medium text-gray-800">
                  Link
                </label>
                {href.trim() ? (
                  <button
                    type="button"
                    title="Open link"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                    onClick={() => window.open(href.trim(), '_blank', 'noopener,noreferrer')}
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <div className="relative">
                {linkLabel ? (
                  <TagIcon className="pointer-events-none absolute left-2.5 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-gray-500" />
                ) : null}
                <input
                  ref={hrefInputRef}
                  id="insert-link-href"
                  type="text"
                  value={linkLabel ?? href}
                  onChange={(e) => {
                    setLinkLabel(null);
                    setHref(e.target.value);
                    setPickerOpen(true);
                  }}
                  onFocus={() => setPickerOpen(true)}
                  placeholder="Paste a link or search"
                  className={`w-full rounded-lg border border-[#c9cccf] bg-white py-2 pr-9 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3] ${
                    linkLabel ? 'pl-9' : 'pl-3'
                  }`}
                />
                {!linkLabel ? (
                  <LinkIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                ) : null}
                <ThemeEditorLinkPickerDropdown
                  open={pickerOpen}
                  placement="above"
                  searchQuery={linkLabel ?? href}
                  onClose={() => setPickerOpen(false)}
                  onSelect={({ link, label }) => {
                    setHref(link);
                    if (label) setLinkLabel(label);
                    if (!text.trim() && label) setText(label);
                    setPickerOpen(false);
                  }}
                />
              </div>
              <p className="mt-1.5 text-[12px] text-gray-500">
                http:// is required for external links
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 py-0.5">
              <input
                type="checkbox"
                checked={openInNewTab}
                onChange={(e) => setOpenInNewTab(e.target.checked)}
                className="h-4 w-4 rounded border-[#c9cccf] text-[#005bd3] focus:ring-[#005bd3]"
              />
              <span className="text-[13px] text-gray-800">Open this link in a new window</span>
            </label>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-[#e1e1e1] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#c9cccf] bg-white px-4 py-2 text-[13px] font-medium text-gray-800 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canInsert}
            onClick={() =>
              onInsert({
                text: text.trim(),
                href: href.trim(),
                openInNewTab,
              })
            }
            className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-colors enabled:bg-gray-900 enabled:hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-[#c9cccf] disabled:text-gray-500"
          >
            Insert
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
