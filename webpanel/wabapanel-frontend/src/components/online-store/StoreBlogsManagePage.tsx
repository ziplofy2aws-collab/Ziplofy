'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronRight, Loader2, PenSquare, Plus, Search } from 'lucide-react';
import {
  adminListCardClass,
  adminListFilterBarClass,
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListPrimaryButtonClass,
  adminListSearchInputClass,
  adminListTableHeadClass,
  adminListTableHeadRowClass,
} from '@/components/admin-list-ui';
import { storeBlogApi, type StoreBlogItem } from '@/lib/store-blog';
import { selectActiveStore, useStoreStore } from '@/stores/storeStore';

type SortField = 'title' | 'comments' | 'updated';
type SortOrder = 'asc' | 'desc';
type CommentsFilter = 'all' | StoreBlogItem['comments'];

const COMMENTS_LABELS: Record<StoreBlogItem['comments'], string> = {
  disabled: 'Disabled',
  moderated: 'Allowed, pending moderation',
  allowed: 'Allowed',
};

function formatBlogUpdatedAt(iso?: string): string {
  if (!iso) return '—';
  try {
    const date = new Date(iso);
    const now = new Date();
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

function compareBlogs(a: StoreBlogItem, b: StoreBlogItem, field: SortField, order: SortOrder): number {
  const dir = order === 'asc' ? 1 : -1;
  switch (field) {
    case 'updated':
      return (new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime()) * dir;
    case 'title':
      return a.title.localeCompare(b.title) * dir;
    case 'comments':
      return a.comments.localeCompare(b.comments) * dir;
    default:
      return 0;
  }
}

export function StoreBlogsManagePage() {
  const router = useRouter();
  const activeStore = useStoreStore(selectActiveStore);
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const storeId = activeStore?._id || null;

  const [blogs, setBlogs] = useState<StoreBlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('updated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [sortOpen, setSortOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [commentsFilter, setCommentsFilter] = useState<CommentsFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const sortRef = useRef<HTMLDivElement | null>(null);
  const filterRef = useRef<HTMLDivElement | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  const load = useCallback(async () => {
    if (!storeId) {
      setBlogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await storeBlogApi.listBlogs(storeId);
      setBlogs(res.data?.success && Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!sortOpen && !commentsOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) setSortOpen(false);
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) setCommentsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sortOpen, commentsOpen]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return blogs.filter((blog) => {
      if (commentsFilter !== 'all' && blog.comments !== commentsFilter) return false;
      if (q && !blog.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [blogs, searchQuery, commentsFilter]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => compareBlogs(a, b, sortField, sortOrder)),
    [filtered, sortField, sortOrder]
  );

  const visibleIds = sorted.map((b) => b._id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected]);

  const hasActiveFilters = searchQuery.trim().length > 0 || commentsFilter !== 'all';
  const showEmptyState = !loading && blogs.length === 0 && storeId;

  if (!storeId) {
    return (
      <div className={adminListPageInnerClass}>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950">
          Select a store from the account menu to manage blogs.
        </div>
      </div>
    );
  }

  return (
    <div className={adminListPageShellClass}>
      <div className={adminListPageInnerClass}>
        <nav className="mb-5 flex min-w-0 flex-wrap items-center gap-1.5 text-[13px]" aria-label="Breadcrumb">
          <Link href="/client/online-store/blogs" className={`inline-flex items-center ${adminListFooterLinkClass}`} aria-label="Blog posts">
            <PenSquare className="h-3.5 w-3.5 shrink-0" />
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-admin-text-subdued" />
          <span className="truncate font-medium text-admin-text">Manage blogs</span>
        </nav>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PenSquare className="h-5 w-5 shrink-0 text-admin-text-secondary" />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Manage blogs</h1>
          </div>
          {!showEmptyState ? (
            <Link href="/client/online-store/blogs/manage/new" className={adminListPrimaryButtonClass}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add blog
            </Link>
          ) : null}
        </div>

        {showEmptyState ? (
          <div className={adminListCardClass}>
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-14 text-center">
              <h2 className="text-[15px] font-semibold text-admin-text">Add your first blog</h2>
              <p className="mt-1.5 max-w-md text-[13px] text-admin-text-secondary">
                Blogs group your articles. Create a blog container, then add blog posts to it.
              </p>
              <Link href="/client/online-store/blogs/manage/new" className={`${adminListPrimaryButtonClass} mt-6`}>
                Add blog
              </Link>
            </div>
          </div>
        ) : (
          <div className={adminListCardClass}>
            <div className={adminListFilterBarClass}>
              {searchOpen || hasActiveFilters ? (
                <div className="flex w-full flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-admin-text-subdued" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Searching all blogs"
                        autoFocus
                        className={adminListSearchInputClass}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                        setCommentsFilter('all');
                      }}
                      className="shrink-0 text-[13px] text-admin-text"
                    >
                      Cancel
                    </button>
                    <div className="relative" ref={sortRef}>
                      <button type="button" onClick={() => setSortOpen(!sortOpen)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-admin-border bg-white hover:bg-[#f6f6f7]">
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                      {sortOpen ? (
                        <div className="absolute right-0 top-full z-30 mt-1 w-56 rounded-xl border border-admin-border bg-white py-2 shadow-lg">
                          <p className="px-3 py-1.5 text-[13px] font-medium">Sort by</p>
                          {(['title', 'comments', 'updated'] as SortField[]).map((field) => (
                            <label key={field} className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-[13px] hover:bg-[#f6f6f7]">
                              <input type="radio" checked={sortField === field} onChange={() => setSortField(field)} />
                              {field === 'title' ? 'Title' : field === 'comments' ? 'Comments' : 'Updated'}
                            </label>
                          ))}
                          <div className="my-2 border-t border-admin-border" />
                          <button type="button" onClick={() => setSortOrder('asc')} className="flex w-full items-center gap-2 px-3 py-2 text-[13px] hover:bg-[#f6f6f7]">
                            <ArrowUp className="h-3.5 w-3.5" /> Oldest first
                          </button>
                          <button type="button" onClick={() => setSortOrder('desc')} className="flex w-full items-center gap-2 px-3 py-2 text-[13px] hover:bg-[#f6f6f7]">
                            <ArrowDown className="h-3.5 w-3.5" /> Newest first
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="relative" ref={filterRef}>
                    <button
                      type="button"
                      onClick={() => setCommentsOpen(!commentsOpen)}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[13px] font-medium ${
                        commentsFilter !== 'all' ? 'border-admin-border bg-[#ebebeb]' : 'border-admin-border bg-white hover:bg-[#f6f6f7]'
                      }`}
                    >
                      {commentsFilter === 'all' ? 'Comments' : COMMENTS_LABELS[commentsFilter]}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    {commentsOpen ? (
                      <div className="absolute left-0 top-full z-30 mt-1 min-w-[220px] rounded-xl border border-admin-border bg-white py-1 shadow-lg">
                        {(['all', 'disabled', 'moderated', 'allowed'] as CommentsFilter[]).map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setCommentsFilter(value);
                              setCommentsOpen(false);
                            }}
                            className={`block w-full px-3 py-2 text-left text-[13px] hover:bg-[#f6f6f7] ${
                              commentsFilter === value ? 'bg-[#f6f6f7] font-medium' : ''
                            }`}
                          >
                            {value === 'all' ? 'All' : COMMENTS_LABELS[value]}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <>
                  <button type="button" onClick={() => setSearchOpen(true)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-admin-border bg-white hover:bg-[#f6f6f7]">
                    <Search className="h-3.5 w-3.5 text-admin-text-secondary" />
                  </button>
                  <div className="relative ml-auto" ref={sortRef}>
                    <button type="button" onClick={() => setSortOpen(!sortOpen)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-admin-border bg-white hover:bg-[#f6f6f7]">
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className={adminListTableHeadRowClass}>
                  <tr>
                    <th className="w-10 px-3 py-2">
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={(e) => {
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) visibleIds.forEach((id) => next.add(id));
                            else visibleIds.forEach((id) => next.delete(id));
                            return next;
                          });
                        }}
                        className="h-3.5 w-3.5 rounded border-[#8c9196]"
                      />
                    </th>
                    <th className={adminListTableHeadClass}>Title</th>
                    <th className={adminListTableHeadClass}>Comments</th>
                    <th className={adminListTableHeadClass}>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-[13px] text-admin-text-secondary">
                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      </td>
                    </tr>
                  ) : sorted.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-[13px] text-admin-text-secondary">
                        No blogs found
                      </td>
                    </tr>
                  ) : (
                    sorted.map((blog) => (
                      <tr
                        key={blog._id}
                        onClick={() => router.push(`/client/online-store/blogs/manage/${blog._id}`)}
                        className={`cursor-pointer border-b border-admin-border/70 transition-colors last:border-b-0 hover:bg-[#f6f6f7] ${
                          selectedIds.has(blog._id) ? 'bg-[#f6f6f7]' : 'bg-white'
                        }`}
                      >
                        <td className="w-10 px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(blog._id)}
                            onChange={(e) => {
                              setSelectedIds((prev) => {
                                const next = new Set(prev);
                                if (e.target.checked) next.add(blog._id);
                                else next.delete(blog._id);
                                return next;
                              });
                            }}
                            className="h-3.5 w-3.5 rounded border-[#8c9196]"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-[13px] font-semibold text-admin-text">{blog.title}</td>
                        <td className="px-3 py-2.5 text-[13px] text-admin-text-secondary">{COMMENTS_LABELS[blog.comments]}</td>
                        <td className="px-3 py-2.5 text-[13px] text-admin-text-secondary">{formatBlogUpdatedAt(blog.updatedAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="py-5 text-center">
          <p className="text-[13px] text-admin-text-secondary">
            Use blogs to organize articles on your storefront.{' '}
            <Link href="/client/online-store/blogs" className={adminListFooterLinkClass}>
              Back to blog posts
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
