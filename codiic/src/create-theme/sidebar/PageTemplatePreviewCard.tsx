import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useStorePages, type StorePage } from '../../contexts/store-page.context';
import { useStore } from '../../contexts/store.context';
import { normalizeStorefrontOrigin } from '../../utils/storefront-url.util';
import { pagePath } from '../../utils/storefront-paths';
import { pickDefaultPreviewPage } from '../utils/page-page-preview.util';
import {
  TemplatePreviewPickerOption,
  TemplatePreviewPickerShell,
  TemplatePreviewPickerThumb,
  templatePreviewCreateClassName,
  templatePreviewSearchClassName,
  templatePreviewViewLinkClassName,
} from './TemplatePreviewPickerShell';

type Props = {
  previewPageHandle: string | null;
  onPreviewPageHandleChange: (handle: string) => void;
  storefrontOrigin?: string | null;
};

function buildStorefrontPageUrl(origin: string | null | undefined, urlHandle: string): string {
  const base = normalizeStorefrontOrigin(origin);
  const path = pagePath(urlHandle);
  if (!base || path === '/pages') return '';
  return `${base}${path}`;
}

export function PageTemplatePreviewCard({
  previewPageHandle,
  onPreviewPageHandleChange,
  storefrontOrigin,
}: Props) {
  const { activeStoreId } = useStore();
  const { pages, fetchPagesByStoreId, loading } = useStorePages();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!activeStoreId) return;
    void fetchPagesByStoreId(activeStoreId);
  }, [activeStoreId, fetchPagesByStoreId]);

  useEffect(() => {
    if (previewPageHandle || !pages.length) return;
    const fallback = pickDefaultPreviewPage(pages);
    if (fallback?.urlHandle) {
      onPreviewPageHandleChange(fallback.urlHandle);
    }
  }, [pages, previewPageHandle, onPreviewPageHandleChange]);

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

  const active = useMemo(() => {
    if (!previewPageHandle) return pickDefaultPreviewPage(pages);
    return (
      pages.find((p) => p.urlHandle === previewPageHandle) ?? pickDefaultPreviewPage(pages)
    );
  }, [pages, previewPageHandle]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) => p.title.toLowerCase().includes(q) || p.urlHandle.toLowerCase().includes(q)
    );
  }, [pages, query]);

  const viewHref = useMemo(() => {
    if (!active?.urlHandle) return null;
    return buildStorefrontPageUrl(storefrontOrigin ?? null, active.urlHandle);
  }, [active?.urlHandle, storefrontOrigin]);

  const selectPage = useCallback(
    (page: StorePage) => {
      const handle = page.urlHandle?.trim();
      if (!handle) return;
      onPreviewPageHandleChange(handle);
      setOpen(false);
      setQuery('');
    },
    [onPreviewPageHandleChange]
  );

  return (
    <TemplatePreviewPickerShell
      rootRef={rootRef}
      label="Preview page"
      open={open}
      onToggle={() => setOpen((v) => !v)}
      trigger={
        <div className="flex items-center gap-3">
          <TemplatePreviewPickerThumb />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-gray-900">
              {loading && !active ? 'Loading…' : active?.title ?? 'Select a page'}
            </p>
            {active?.urlHandle ? (
              <p className="truncate text-[11px] text-gray-500">/pages/{active.urlHandle}</p>
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
            <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden />
          </a>
        ) : null
      }
    >
      <div className="border-b border-[#eceef0] p-2.5">
        <div className="relative">
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages"
            className={templatePreviewSearchClassName}
            aria-label="Search pages"
          />
        </div>
      </div>

      <ul className="max-h-56 overflow-y-auto overscroll-contain py-1">
        {filtered.length === 0 ? (
          <li className="px-3 py-4 text-center text-[12px] text-gray-500">
            {loading ? 'Loading pages…' : query.trim() ? 'No pages match' : 'No pages yet'}
          </li>
        ) : (
          filtered.map((page) => {
            const selected = page.urlHandle === (previewPageHandle ?? active?.urlHandle);
            return (
              <li key={page._id}>
                <TemplatePreviewPickerOption
                  selected={selected}
                  onClick={() => selectPage(page)}
                  thumb={<TemplatePreviewPickerThumb size="sm" />}
                  title={page.title}
                  subtitle={
                    page.urlHandle
                      ? `/pages/${page.urlHandle}${page.visibility === 'hidden' ? ' · Hidden' : ''}`
                      : undefined
                  }
                />
              </li>
            );
          })
        )}
      </ul>

      <div className="border-t border-[#eceef0] p-1.5">
        <Link
          to="/online-store/pages/new"
          onClick={() => setOpen(false)}
          className={templatePreviewCreateClassName}
        >
          Create page
        </Link>
      </div>
    </TemplatePreviewPickerShell>
  );
}
