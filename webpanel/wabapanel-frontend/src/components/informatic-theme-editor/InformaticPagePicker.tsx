'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, FileText, Plus, Scale, Search } from 'lucide-react';
import Link from 'next/link';
import {
  INFORMATIC_POLICY_PAGES,
  policyPageLabel,
  type InformaticPolicyTemplateId,
} from '@/lib/informatic-policy-pages';
import { storePageApi, type StorePageItem } from '@/lib/store-page';
import {
  INFORMATIC_PREVIEW_PAGES,
  type InformaticPreviewPageId,
} from './InformaticLivePreview';

type PickerView = 'root' | 'custom-pages' | 'policies';

export type InformaticPagePickerValue =
  | { kind: 'template'; templateId: InformaticPreviewPageId }
  | { kind: 'policy'; templateId: InformaticPolicyTemplateId }
  | { kind: 'custom-page'; templateId: 'page'; urlHandle: string; title: string };

type Props = {
  storeId: string | null;
  value: InformaticPagePickerValue;
  onChange: (value: InformaticPagePickerValue) => void;
};

function labelForValue(value: InformaticPagePickerValue): string {
  if (value.kind === 'custom-page') return value.title || value.urlHandle;
  if (value.kind === 'policy') return policyPageLabel(value.templateId);
  return INFORMATIC_PREVIEW_PAGES.find((p) => p.id === value.templateId)?.label ?? value.templateId;
}

export function InformaticPagePicker({ storeId, value, onChange }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PickerView>('root');
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
  }, [storeId]);

  useEffect(() => {
    if (!open) {
      setView('root');
      setQuery('');
      return;
    }
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    const focusTimer = window.setTimeout(
      () => searchRef.current?.focus(),
      view === 'custom-pages' ? 40 : 0
    );
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.clearTimeout(focusTimer);
    };
  }, [open, view]);

  const filteredPages = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = pages.filter((p) => p.urlHandle?.trim());
    if (!q) return list;
    return list.filter(
      (p) => p.title.toLowerCase().includes(q) || p.urlHandle.toLowerCase().includes(q)
    );
  }, [pages, query]);

  const selectTemplate = useCallback(
    (templateId: InformaticPreviewPageId) => {
      onChange({ kind: 'template', templateId });
      setOpen(false);
    },
    [onChange]
  );

  const selectPolicy = useCallback(
    (templateId: InformaticPolicyTemplateId) => {
      onChange({ kind: 'policy', templateId });
      setOpen(false);
    },
    [onChange]
  );

  const selectCustomPage = useCallback(
    (page: StorePageItem) => {
      const handle = page.urlHandle?.trim();
      if (!handle) return;
      onChange({
        kind: 'custom-page',
        templateId: 'page',
        urlHandle: handle,
        title: page.title,
      });
      setOpen(false);
    },
    [onChange]
  );

  const triggerLabel = labelForValue(value);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 min-w-[220px] max-w-[min(100vw-2rem,320px)] cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-4 pr-3 text-sm font-medium text-gray-900 shadow-sm transition hover:border-gray-300 hover:bg-white focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5"
      >
        <span className="min-w-0 flex-1 truncate text-left">{triggerLabel}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute left-1/2 top-[calc(100%+8px)] z-[2000] w-[min(100vw-2rem,320px)] -translate-x-1/2 overflow-hidden rounded-xl border border-[#d1d4d8] bg-white shadow-[0_12px_32px_rgba(22,28,36,0.16)]"
        >
          {view === 'root' ? (
            <>
              <div className="border-b border-[#eceef0] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Theme pages
              </div>
              <ul className="max-h-64 overflow-y-auto overscroll-contain py-1">
                {INFORMATIC_PREVIEW_PAGES.map((page) => {
                  const selected = value.kind === 'template' && value.templateId === page.id;
                  return (
                    <li key={page.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => selectTemplate(page.id)}
                        className={`flex w-full px-3 py-2.5 text-left text-[13px] transition-colors ${
                          selected
                            ? 'bg-[#eef3ff] font-semibold text-[#005bd3]'
                            : 'text-gray-900 hover:bg-[#f6f6f7]'
                        }`}
                      >
                        {page.label}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-[#eceef0]">
                <button
                  type="button"
                  onClick={() => setView('policies')}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] font-medium text-gray-900 transition hover:bg-[#f6f6f7]"
                >
                  <Scale className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                  <span className="min-w-0 flex-1">Policies</span>
                  <span className="text-[11px] text-gray-500">{INFORMATIC_POLICY_PAGES.length}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setView('custom-pages')}
                  className="flex w-full items-center gap-2 border-t border-[#eceef0] px-3 py-2.5 text-left text-[13px] font-medium text-gray-900 transition hover:bg-[#f6f6f7]"
                >
                  <FileText className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                  <span className="min-w-0 flex-1">Pages</span>
                  <span className="text-[11px] text-gray-500">{loading ? '…' : pages.length}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                </button>
              </div>
            </>
          ) : view === 'policies' ? (
            <>
              <div className="flex items-center gap-1 border-b border-[#eceef0] px-1 py-1">
                <button
                  type="button"
                  onClick={() => setView('root')}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-[#f6f6f7]"
                  aria-label="Back to theme pages"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-[13px] font-semibold text-gray-900">Store policies</span>
              </div>

              <ul className="max-h-64 overflow-y-auto overscroll-contain py-1">
                {INFORMATIC_POLICY_PAGES.map((policy) => {
                  const selected = value.kind === 'policy' && value.templateId === policy.id;
                  return (
                    <li key={policy.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => selectPolicy(policy.id)}
                        className={`flex w-full flex-col px-3 py-2.5 text-left transition-colors ${
                          selected
                            ? 'bg-[#eef3ff] text-[#005bd3]'
                            : 'text-gray-900 hover:bg-[#f6f6f7]'
                        }`}
                      >
                        <span
                          className={`truncate text-[13px] ${selected ? 'font-semibold' : 'font-medium'}`}
                        >
                          {policy.label}
                        </span>
                        <span className="truncate text-[11px] text-gray-500">{policy.route}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {storeId ? (
                <div className="border-t border-[#eceef0] p-1.5">
                  <Link
                    href="/client/online-store/policies"
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold text-[#005bd3] transition hover:bg-[#eef3ff]"
                    onClick={() => setOpen(false)}
                  >
                    <Scale className="h-4 w-4 shrink-0" aria-hidden />
                    Manage policies
                  </Link>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 border-b border-[#eceef0] px-1 py-1">
                <button
                  type="button"
                  onClick={() => setView('root')}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-[#f6f6f7]"
                  aria-label="Back to theme pages"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-[13px] font-semibold text-gray-900">Custom pages</span>
              </div>

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
                    placeholder="Search pages"
                    className="w-full rounded-lg border border-[#c9cccf] bg-[#fafbfc] py-2 pl-8 pr-3 text-[13px] text-gray-900 outline-none transition focus:border-[#005bd3] focus:bg-white focus:ring-2 focus:ring-[#005bd3]/15"
                    aria-label="Search custom pages"
                  />
                </div>
              </div>

              <ul className="max-h-56 overflow-y-auto overscroll-contain py-1">
                {!storeId ? (
                  <li className="px-3 py-4 text-center text-[12px] text-gray-500">
                    Select a store to browse custom pages.
                  </li>
                ) : filteredPages.length === 0 ? (
                  <li className="px-3 py-4 text-center text-[12px] text-gray-500">
                    {loading ? 'Loading pages…' : query.trim() ? 'No pages match' : 'No custom pages yet'}
                  </li>
                ) : (
                  filteredPages.map((page) => {
                    const selected =
                      value.kind === 'custom-page' && value.urlHandle === page.urlHandle;
                    return (
                      <li key={page._id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => selectCustomPage(page)}
                          className={`flex w-full flex-col px-3 py-2.5 text-left transition-colors ${
                            selected
                              ? 'bg-[#eef3ff] text-[#005bd3]'
                              : 'text-gray-900 hover:bg-[#f6f6f7]'
                          }`}
                        >
                          <span
                            className={`truncate text-[13px] ${selected ? 'font-semibold' : 'font-medium'}`}
                          >
                            {page.title}
                          </span>
                          <span className="truncate text-[11px] text-gray-500">/{page.urlHandle}</span>
                        </button>
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
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function pagePickerValueToTemplateId(value: InformaticPagePickerValue): InformaticPreviewPageId {
  if (value.kind === 'custom-page') return 'page';
  if (value.kind === 'policy') return value.templateId as InformaticPreviewPageId;
  return value.templateId;
}
