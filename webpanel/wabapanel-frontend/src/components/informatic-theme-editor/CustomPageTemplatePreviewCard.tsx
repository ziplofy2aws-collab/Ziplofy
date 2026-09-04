'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ExternalLink, FileText, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { storePageApi, type StorePageItem } from '@/lib/store-page';
import {
  TemplatePreviewPickerOption,
  TemplatePreviewPickerShell,
  TemplatePreviewPickerThumb,
  templatePreviewSearchClassName,
  templatePreviewViewLinkClassName,
} from './TemplatePreviewPickerShell';
import type { CustomPagePreviewSelection } from './custom-page-preview.util';
import {
  buildStorefrontCustomPageUrl,
  pickDefaultCustomPagePreview,
} from './custom-page-preview.util';

type Props = {
  storeId: string | null;
  previewSelection: CustomPagePreviewSelection | null;
  onPreviewSelectionChange: (selection: CustomPagePreviewSelection) => void;
  storefrontOrigin?: string | null;
};

export function CustomPageTemplatePreviewCard({
  storeId,
  previewSelection,
  onPreviewSelectionChange,
  storefrontOrigin,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<StorePageItem[]>([]);

  useEffect(() => {
    if (!storeId) {
      setPages([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void storePageApi
      .listPages(storeId)
      .then((res) => {
        if (!cancelled) setPages(res.data.data || []);
      })
      .catch(() => {
        if (!cancelled) setPages([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  useEffect(() => {
    if (previewSelection || !pages.length) return;
    const fallback = pickDefaultCustomPagePreview(pages);
    if (fallback) onPreviewSelectionChange(fallback);
  }, [previewSelection, pages, onPreviewSelectionChange]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 40);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  const selectablePages = useMemo(
    () => pages.filter((p) => p.urlHandle?.trim()),
    [pages]
  );

  const activePage = useMemo(() => {
    if (previewSelection?.urlHandle) {
      const match = selectablePages.find((p) => p.urlHandle === previewSelection.urlHandle);
      if (match) return match;
    }
    const fallback = pickDefaultCustomPagePreview(selectablePages);
    return fallback
      ? selectablePages.find((p) => p.urlHandle === fallback.urlHandle) ?? null
      : selectablePages[0] ?? null;
  }, [previewSelection, selectablePages]);

  const activeHandle = activePage?.urlHandle ?? previewSelection?.urlHandle ?? '';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return selectablePages;
    return selectablePages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.urlHandle.toLowerCase().includes(q)
    );
  }, [selectablePages, query]);

  const viewHref = useMemo(
    () => (activeHandle ? buildStorefrontCustomPageUrl(storefrontOrigin ?? null, activeHandle) : null),
    [activeHandle, storefrontOrigin]
  );

  const selectPage = useCallback(
    (page: StorePageItem) => {
      const handle = page.urlHandle?.trim();
      if (!handle) return;
      onPreviewSelectionChange({ urlHandle: handle, title: page.title });
      setOpen(false);
      setQuery('');
    },
    [onPreviewSelectionChange]
  );

  return (
    <TemplatePreviewPickerShell
      rootRef={rootRef}
      label="Preview custom page"
      open={open}
      onToggle={() => setOpen((v) => !v)}
      trigger={
        <div className="flex items-center gap-3">
          <TemplatePreviewPickerThumb />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-gray-900">
              {loading && !activePage ? 'Loading…' : activePage?.title ?? 'Select a custom page'}
            </p>
            {activeHandle ? (
              <p className="truncate text-[11px] text-gray-500">/{activeHandle}</p>
            ) : (
              <p className="truncate text-[11px] text-gray-500">Choose which page to preview</p>
            )}
          </div>
        </div>
      }
      triggerAside={
        viewHref ? (
          <a
            href={viewHref}
            target="_blank"
            rel="noopener noreferrer"
            title="View page on storefront"
            onClick={(e) => e.stopPropagation()}
            className={templatePreviewViewLinkClassName}
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        ) : null
      }
    >
      <div className="border-b border-[#eceef0] p-2.5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search custom pages"
            className={templatePreviewSearchClassName}
            aria-label="Search custom pages"
          />
        </div>
      </div>

      <ul className="max-h-56 overflow-y-auto overscroll-contain py-1">
        {!storeId ? (
          <li className="px-3 py-4 text-center text-[12px] text-gray-500">
            Select a store to preview custom pages.
          </li>
        ) : filtered.length === 0 ? (
          <li className="px-3 py-4 text-center text-[12px] text-gray-500">
            {loading ? 'Loading pages…' : query.trim() ? 'No pages match' : 'No custom pages yet'}
          </li>
        ) : (
          filtered.map((page) => {
            const selected = page.urlHandle === activeHandle;
            return (
              <li key={page._id}>
                <TemplatePreviewPickerOption
                  selected={selected}
                  onClick={() => selectPage(page)}
                  thumb={
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#f1f2f3] text-[#8c9196]">
                      <FileText className="h-4 w-4" aria-hidden />
                    </span>
                  }
                  title={page.title}
                  subtitle={`/${page.urlHandle}`}
                />
              </li>
            );
          })
        )}
      </ul>

      {storeId ? (
        <div className="border-t border-[#eceef0] p-1.5">
          <Link
            href="/client/online-store/pages/new"
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold text-[#005bd3] transition hover:bg-[#eef3ff]"
            onClick={() => setOpen(false)}
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            Create page
          </Link>
        </div>
      ) : null}
    </TemplatePreviewPickerShell>
  );
}
