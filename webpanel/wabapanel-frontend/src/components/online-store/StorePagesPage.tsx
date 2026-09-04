'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  FileText,
  Loader2,
  Plus,
  Search,
} from 'lucide-react';
import {
  adminListCardClass,
  adminListFilterBarClass,
  adminListFilterChipClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListPrimaryButtonClass,
  adminListSearchInputClass,
  adminListTableHeadClass,
  adminListTableHeadRowClass,
} from '@/components/admin-list-ui';
import { storePageApi, stripHtmlPreview, type StorePageItem } from '@/lib/store-page';
import { selectActiveStore, useStoreStore } from '@/stores/storeStore';

type SortField = 'title' | 'updated';
type SortOrder = 'asc' | 'desc';

function formatRelativeUpdatedAt(iso?: string): string {
  if (!iso) return '—';
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    const isSameDay =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    const time = date.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
    if (isSameDay) return `Today at ${time.toLowerCase()}`;
    return `${date.toLocaleString(undefined, { weekday: 'long' })} at ${time.toLowerCase()}`;
  } catch {
    return iso;
  }
}

function VisibilityBadge({ visibility }: { visibility: 'visible' | 'hidden' }) {
  if (visibility === 'visible') {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[12px] font-medium text-emerald-700">
        Visible
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-[#ebebeb] px-2 py-0.5 text-[12px] font-medium text-admin-text-secondary">
      Hidden
    </span>
  );
}

export function StorePagesPage() {
  const router = useRouter();
  const activeStore = useStoreStore(selectActiveStore);
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const storeId = activeStore?._id || null;

  const [pages, setPages] = useState<StorePageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('updated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [sortOpen, setSortOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const sortRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  const load = useCallback(async () => {
    if (!storeId) {
      setPages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await storePageApi.listPages(storeId);
      setPages(res.data?.success && Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      toast.error('Failed to load pages');
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!sortOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!sortRef.current?.contains(event.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sortOpen]);

  const filteredPages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = pages;
    if (q) {
      list = list.filter(
        (page) =>
          page.title.toLowerCase().includes(q) ||
          stripHtmlPreview(page.content).toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'title') {
        cmp = a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      } else {
        cmp = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [pages, searchQuery, sortField, sortOrder]);

  const allVisibleSelected =
    filteredPages.length > 0 && filteredPages.every((page) => selectedIds.has(page._id));
  const someSelected = filteredPages.some((page) => selectedIds.has(page._id));

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected && !allVisibleSelected;
  }, [someSelected, allVisibleSelected]);

  const handleColumnSort = (field: SortField) => {
    if (sortField === field) setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortOrder(field === 'updated' ? 'desc' : 'asc');
    }
  };

  if (!storeId) {
    return (
      <div className={adminListPageInnerClass}>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950">
          Select a store from the account menu to manage pages.
        </div>
      </div>
    );
  }

  return (
    <div className={adminListPageShellClass}>
      <div className={adminListPageInnerClass}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 shrink-0 text-admin-text-secondary" />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Pages</h1>
          </div>
          <Link href="/client/online-store/pages/new" className={adminListPrimaryButtonClass}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add page
          </Link>
        </div>

        <div className={adminListCardClass}>
          <div className={adminListFilterBarClass}>
            {searchOpen ? (
              <div className="flex w-full items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-admin-text-subdued" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Searching all pages"
                    autoFocus
                    className={adminListSearchInputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="shrink-0 text-[13px] text-admin-text hover:text-admin-text-secondary"
                >
                  Cancel
                </button>
                <div className="relative" ref={sortRef}>
                  <button
                    type="button"
                    onClick={() => setSortOpen(!sortOpen)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-admin-border bg-white hover:bg-[#f6f6f7]"
                  >
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                  {sortOpen ? (
                    <div className="absolute right-0 top-full z-30 mt-1 w-48 rounded-lg border border-admin-border bg-white py-2 shadow-lg">
                      <p className="px-3 pb-1.5 text-[12px] font-medium text-admin-text-secondary">Sort by</p>
                      {(['title', 'updated'] as SortField[]).map((field) => (
                        <label key={field} className="flex cursor-pointer items-center gap-2 px-3 py-1 text-[13px] hover:bg-[#f6f6f7]">
                          <input type="radio" checked={sortField === field} onChange={() => setSortField(field)} />
                          {field === 'title' ? 'Title' : 'Updated'}
                        </label>
                      ))}
                      <div className="my-1.5 border-t border-admin-border" />
                      <button type="button" onClick={() => setSortOrder('asc')} className="flex w-full items-center gap-2 px-3 py-1 text-[13px] hover:bg-[#f6f6f7]">
                        <ArrowUp className="h-3.5 w-3.5" /> Ascending
                      </button>
                      <button type="button" onClick={() => setSortOrder('desc')} className="flex w-full items-center gap-2 px-3 py-1 text-[13px] hover:bg-[#f6f6f7]">
                        <ArrowDown className="h-3.5 w-3.5" /> Descending
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button type="button" className={adminListFilterChipClass}>
                    All
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Search"
                    onClick={() => setSearchOpen(true)}
                    className="inline-flex h-7 items-center gap-1 rounded-lg border border-admin-border bg-white px-2 text-admin-text-secondary hover:bg-[#f6f6f7]"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </button>
                  <div className="relative" ref={sortRef}>
                    <button
                      type="button"
                      onClick={() => setSortOpen(!sortOpen)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-admin-border bg-white hover:bg-[#f6f6f7]"
                    >
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className={adminListTableHeadRowClass}>
                  <th className="w-10 px-3 py-2 text-center">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={(e) => {
                        setSelectedIds((prev) => {
                          const next = new Set(prev);
                          for (const page of filteredPages) {
                            if (e.target.checked) next.add(page._id);
                            else next.delete(page._id);
                          }
                          return next;
                        });
                      }}
                      className="h-3.5 w-3.5 rounded border-[#8c9196]"
                    />
                  </th>
                  <th className={adminListTableHeadClass}>
                    <button type="button" onClick={() => handleColumnSort('title')} className="inline-flex items-center gap-1 hover:text-admin-text">
                      Title
                    </button>
                  </th>
                  <th className={adminListTableHeadClass}>Visibility</th>
                  <th className={adminListTableHeadClass}>Content</th>
                  <th className={`${adminListTableHeadClass} text-right`}>
                    <button type="button" onClick={() => handleColumnSort('updated')} className="inline-flex items-center gap-1 hover:text-admin-text">
                      Updated
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && pages.length === 0 ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index} className="animate-pulse border-b border-admin-border/70">
                      <td className="px-3 py-2.5"><div className="mx-auto h-3.5 w-3.5 rounded bg-[#ebebeb]" /></td>
                      <td className="px-3 py-2.5"><div className="h-4 w-32 rounded bg-[#ebebeb]" /></td>
                      <td className="px-3 py-2.5"><div className="h-5 w-16 rounded-full bg-[#ebebeb]" /></td>
                      <td className="px-3 py-2.5"><div className="h-3.5 w-56 rounded bg-[#ebebeb]" /></td>
                      <td className="px-3 py-2.5"><div className="ml-auto h-3.5 w-24 rounded bg-[#ebebeb]" /></td>
                    </tr>
                  ))
                ) : filteredPages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-[13px] text-admin-text-secondary">
                      {searchQuery.trim() ? 'No pages match your search' : 'No pages yet'}
                    </td>
                  </tr>
                ) : (
                  filteredPages.map((page) => (
                    <tr
                      key={page._id}
                      onClick={() => router.push(`/client/online-store/pages/${page._id}`)}
                      className={`cursor-pointer border-b border-admin-border/70 transition-colors last:border-b-0 hover:bg-[#f6f6f7] ${
                        selectedIds.has(page._id) ? 'bg-[#f6f6f7]' : 'bg-white'
                      }`}
                    >
                      <td className="w-10 px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(page._id)}
                          onChange={(e) => {
                            setSelectedIds((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(page._id);
                              else next.delete(page._id);
                              return next;
                            });
                          }}
                          className="h-3.5 w-3.5 rounded border-[#8c9196]"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="truncate text-[13px] font-semibold text-admin-text">{page.title}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <VisibilityBadge visibility={page.visibility} />
                      </td>
                      <td className="max-w-[360px] px-3 py-2.5">
                        <span className="line-clamp-1 text-[13px] text-admin-text-secondary">
                          {stripHtmlPreview(page.content)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right text-[13px] text-admin-text-secondary">
                        {formatRelativeUpdatedAt(page.updatedAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="py-5 text-center">
          <p className="text-xs text-admin-text-secondary">
            Custom pages appear on your storefront at{' '}
            <span className="font-mono text-[11px]">/your-handle</span>
          </p>
        </div>
      </div>
    </div>
  );
}
