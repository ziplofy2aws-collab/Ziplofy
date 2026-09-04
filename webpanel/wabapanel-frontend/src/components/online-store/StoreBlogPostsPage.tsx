'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ImageIcon,
  Loader2,
  PenSquare,
  Plus,
  Search,
} from 'lucide-react';
import {
  adminListCardClass,
  adminListFilterBarClass,
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListPrimaryButtonClass,
  adminListSearchInputClass,
  adminListSecondaryButtonClass,
  adminListTableHeadClass,
  adminListTableHeadRowClass,
} from '@/components/admin-list-ui';
import { storeBlogApi, type StoreBlogItem, type StoreBlogPostItem } from '@/lib/store-blog';
import { selectActiveStore, useStoreStore } from '@/stores/storeStore';

type SortField = 'updated' | 'title' | 'blogTitle' | 'author' | 'published';
type SortOrder = 'asc' | 'desc';

const SORT_LABELS: Record<SortField, string> = {
  updated: 'Updated',
  title: 'Title',
  blogTitle: 'Blog title',
  author: 'Author',
  published: 'Published',
};

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

function formatPublishedAt(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

function VisibilityBadge({ visibility }: { visibility: 'visible' | 'hidden' }) {
  if (visibility === 'visible') {
    return (
      <span className="inline-flex items-center rounded-full bg-[#cdfee1] px-2 py-0.5 text-[12px] font-medium text-[#0c5132]">
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

function BlogPostsEmptyIllustration() {
  return (
    <div className="relative mx-auto mb-6 flex h-36 w-36 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-[#ebebeb]" />
      <div className="relative z-[1] mt-2 h-[88px] w-[72px] rounded-md border border-admin-border bg-white shadow-sm">
        <div className="p-2.5 pl-3">
          <div className="mb-1.5 h-7 w-full rounded-sm bg-[#ebebeb]" />
          <div className="space-y-1">
            <div className="h-1 w-full rounded bg-[#ebebeb]" />
            <div className="h-1 w-[85%] rounded bg-[#ebebeb]" />
            <div className="h-1 w-[70%] rounded bg-[#ebebeb]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterDropdown({
  label,
  valueLabel,
  active,
  children,
}: {
  label: string;
  valueLabel: string;
  active?: boolean;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[13px] font-medium transition-colors ${
          active
            ? 'border-admin-border bg-[#ebebeb] text-admin-text'
            : 'border-admin-border bg-white text-admin-text hover:bg-[#f6f6f7]'
        }`}
      >
        {valueLabel || label}
        <ChevronDown className="h-3.5 w-3.5 text-admin-text-subdued" />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-30 mt-1 max-h-60 min-w-[180px] overflow-y-auto rounded-xl border border-admin-border bg-white py-1 shadow-lg">
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}

function FilterOption({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full px-3 py-2 text-left text-[13px] transition-colors ${
        selected ? 'bg-[#f6f6f7] font-medium text-admin-text' : 'text-admin-text hover:bg-[#f6f6f7]'
      }`}
    >
      {children}
    </button>
  );
}

function defaultSortOrder(field: SortField): SortOrder {
  return field === 'updated' || field === 'published' ? 'desc' : 'asc';
}

function comparePosts(
  a: StoreBlogPostItem,
  b: StoreBlogPostItem,
  field: SortField,
  order: SortOrder
): number {
  const dir = order === 'asc' ? 1 : -1;
  switch (field) {
    case 'updated':
      return (new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime()) * dir;
    case 'published':
      return (new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()) * dir;
    case 'title':
      return a.title.localeCompare(b.title) * dir;
    case 'blogTitle':
      return (a.blogTitle || '').localeCompare(b.blogTitle || '') * dir;
    case 'author':
      return (a.author || '').localeCompare(b.author || '') * dir;
    default:
      return 0;
  }
}

export function StoreBlogPostsPage() {
  const router = useRouter();
  const activeStore = useStoreStore(selectActiveStore);
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const storeId = activeStore?._id || null;

  const [posts, setPosts] = useState<StoreBlogPostItem[]>([]);
  const [blogs, setBlogs] = useState<StoreBlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('updated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [sortOpen, setSortOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [blogFilter, setBlogFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const sortRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  const load = useCallback(async () => {
    if (!storeId) {
      setPosts([]);
      setBlogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [postsRes, blogsRes] = await Promise.all([
        storeBlogApi.listPosts(storeId),
        storeBlogApi.listBlogs(storeId),
      ]);
      setPosts(postsRes.data?.success && Array.isArray(postsRes.data.data) ? postsRes.data.data : []);
      setBlogs(blogsRes.data?.success && Array.isArray(blogsRes.data.data) ? blogsRes.data.data : []);
    } catch {
      toast.error('Failed to load blog posts');
      setPosts([]);
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

  const authors = useMemo(() => {
    const unique = new Set<string>();
    for (const post of posts) {
      if (post.author?.trim()) unique.add(post.author.trim());
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      if (visibilityFilter !== 'all' && post.visibility !== visibilityFilter) return false;
      if (blogFilter !== 'all' && post.blogId !== blogFilter) return false;
      if (authorFilter !== 'all' && post.author !== authorFilter) return false;
      if (q) {
        const haystack = [post.title, post.author, post.blogTitle, ...(post.tags || [])].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [posts, searchQuery, visibilityFilter, blogFilter, authorFilter]);

  const sortedPosts = useMemo(
    () => [...filteredPosts].sort((a, b) => comparePosts(a, b, sortField, sortOrder)),
    [filteredPosts, sortField, sortOrder]
  );

  const visibleIds = useMemo(() => sortedPosts.map((p) => p._id), [sortedPosts]);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    visibilityFilter !== 'all' ||
    blogFilter !== 'all' ||
    authorFilter !== 'all';

  const showEmptyState = !loading && posts.length === 0 && storeId;

  const clearFilters = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setVisibilityFilter('all');
    setBlogFilter('all');
    setAuthorFilter('all');
  };

  const handleColumnSort = (field: SortField) => {
    if (sortField === field) setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortOrder(defaultSortOrder(field));
    }
  };

  if (!storeId) {
    return (
      <div className={adminListPageInnerClass}>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950">
          Select a store from the account menu to manage blog content.
        </div>
      </div>
    );
  }

  return (
    <div className={adminListPageShellClass}>
      <div className={adminListPageInnerClass}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PenSquare className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Blog posts</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/client/online-store/blogs/manage" className={adminListSecondaryButtonClass}>
              <PenSquare className="mr-1.5 h-3.5 w-3.5" />
              Manage blogs
            </Link>
            {!showEmptyState ? (
              <Link href="/client/online-store/blogs/posts/new" className={adminListPrimaryButtonClass}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create blog post
              </Link>
            ) : null}
          </div>
        </div>

        {showEmptyState ? (
          <div className={adminListCardClass}>
            <div className="flex min-h-[420px] flex-col items-center justify-center bg-white px-6 py-14 text-center">
              <BlogPostsEmptyIllustration />
              <h2 className="text-[15px] font-semibold text-admin-text">Write a blog post</h2>
              <p className="mt-1.5 max-w-md text-[13px] font-normal leading-relaxed text-admin-text-secondary">
                Blog posts are a great way to build a community around your products and your brand.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <Link href="/client/online-store/blogs/manage/new" className={adminListSecondaryButtonClass}>
                  Add blog first
                </Link>
                <Link href="/client/online-store/blogs/posts/new" className={adminListPrimaryButtonClass}>
                  Create blog post
                </Link>
              </div>
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
                        placeholder="Searching all blog posts"
                        autoFocus
                        className={adminListSearchInputClass}
                      />
                    </div>
                    <button type="button" onClick={clearFilters} className="shrink-0 text-[13px] text-admin-text hover:text-admin-text-secondary">
                      Cancel
                    </button>
                    <div className="relative" ref={sortRef}>
                      <button
                        type="button"
                        title="Sort"
                        onClick={() => setSortOpen(!sortOpen)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-admin-border bg-white text-admin-text-secondary hover:bg-[#f6f6f7]"
                      >
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                      {sortOpen ? (
                        <div className="absolute right-0 top-full z-30 mt-1 w-56 rounded-xl border border-admin-border bg-white py-2 shadow-lg">
                          <p className="px-3 py-1.5 text-[13px] font-medium text-admin-text">Sort by</p>
                          {(Object.keys(SORT_LABELS) as SortField[]).map((field) => (
                            <label key={field} className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-[13px] hover:bg-[#f6f6f7]">
                              <input
                                type="radio"
                                checked={sortField === field}
                                onChange={() => {
                                  setSortField(field);
                                  setSortOrder(defaultSortOrder(field));
                                }}
                                className="h-3.5 w-3.5"
                              />
                              {SORT_LABELS[field]}
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
                  <div className="flex flex-wrap gap-2">
                    <FilterDropdown
                      label="Visibility"
                      valueLabel={visibilityFilter === 'all' ? 'Visibility' : visibilityFilter === 'visible' ? 'Visible' : 'Hidden'}
                      active={visibilityFilter !== 'all'}
                    >
                      {(close) => (
                        <>
                          {(['all', 'visible', 'hidden'] as const).map((v) => (
                            <FilterOption
                              key={v}
                              selected={visibilityFilter === v}
                              onClick={() => {
                                setVisibilityFilter(v);
                                close();
                              }}
                            >
                              {v === 'all' ? 'All' : v === 'visible' ? 'Visible' : 'Hidden'}
                            </FilterOption>
                          ))}
                        </>
                      )}
                    </FilterDropdown>
                    <FilterDropdown
                      label="Blog"
                      valueLabel={blogFilter === 'all' ? 'Blog' : blogs.find((b) => b._id === blogFilter)?.title || 'Blog'}
                      active={blogFilter !== 'all'}
                    >
                      {(close) => (
                        <>
                          <FilterOption selected={blogFilter === 'all'} onClick={() => { setBlogFilter('all'); close(); }}>
                            All
                          </FilterOption>
                          {blogs.map((blog) => (
                            <FilterOption
                              key={blog._id}
                              selected={blogFilter === blog._id}
                              onClick={() => { setBlogFilter(blog._id); close(); }}
                            >
                              {blog.title}
                            </FilterOption>
                          ))}
                        </>
                      )}
                    </FilterDropdown>
                    <FilterDropdown
                      label="Author"
                      valueLabel={authorFilter === 'all' ? 'Author' : authorFilter}
                      active={authorFilter !== 'all'}
                    >
                      {(close) => (
                        <>
                          <FilterOption selected={authorFilter === 'all'} onClick={() => { setAuthorFilter('all'); close(); }}>
                            All
                          </FilterOption>
                          {authors.map((author) => (
                            <FilterOption
                              key={author}
                              selected={authorFilter === author}
                              onClick={() => { setAuthorFilter(author); close(); }}
                            >
                              {author}
                            </FilterOption>
                          ))}
                        </>
                      )}
                    </FilterDropdown>
                  </div>
                </div>
              ) : (
                <>
                  <button type="button" onClick={() => setSearchOpen(true)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-admin-border bg-white hover:bg-[#f6f6f7]">
                    <Search className="h-3.5 w-3.5 text-admin-text-secondary" />
                  </button>
                  <div className="relative ml-auto" ref={sortRef}>
                    <button type="button" onClick={() => setSortOpen(!sortOpen)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-admin-border bg-white hover:bg-[#f6f6f7]">
                      <ArrowUpDown className="h-3.5 w-3.5 text-admin-text-secondary" />
                    </button>
                    {sortOpen ? (
                      <div className="absolute right-0 top-full z-30 mt-1 w-56 rounded-xl border border-admin-border bg-white py-2 shadow-lg">
                        <p className="px-3 py-1.5 text-[13px] font-medium">Sort by</p>
                        {(Object.keys(SORT_LABELS) as SortField[]).map((field) => (
                          <label key={field} className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-[13px] hover:bg-[#f6f6f7]">
                            <input type="radio" checked={sortField === field} onChange={() => { setSortField(field); setSortOrder(defaultSortOrder(field)); }} />
                            {SORT_LABELS[field]}
                          </label>
                        ))}
                      </div>
                    ) : null}
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
                    <th className={adminListTableHeadClass}>
                      <button type="button" onClick={() => handleColumnSort('title')} className="inline-flex items-center gap-1 hover:text-admin-text">
                        Title
                        {sortField === 'title' ? <ChevronDown className={`h-3.5 w-3.5 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} /> : null}
                      </button>
                    </th>
                    <th className={adminListTableHeadClass}>Visibility</th>
                    <th className={adminListTableHeadClass}>
                      <button type="button" onClick={() => handleColumnSort('author')} className="inline-flex items-center gap-1 hover:text-admin-text">
                        Author
                      </button>
                    </th>
                    <th className={adminListTableHeadClass}>
                      <button type="button" onClick={() => handleColumnSort('blogTitle')} className="inline-flex items-center gap-1 hover:text-admin-text">
                        Blog
                      </button>
                    </th>
                    <th className={adminListTableHeadClass}>
                      <button type="button" onClick={() => handleColumnSort('updated')} className="inline-flex items-center gap-1 hover:text-admin-text">
                        Updated
                      </button>
                    </th>
                    <th className={adminListTableHeadClass}>
                      <button type="button" onClick={() => handleColumnSort('published')} className="inline-flex items-center gap-1 hover:text-admin-text">
                        Published
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading && posts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-[13px] text-admin-text-secondary">
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading blog posts…
                        </span>
                      </td>
                    </tr>
                  ) : sortedPosts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-[13px] text-admin-text-secondary">
                        No blog posts found
                      </td>
                    </tr>
                  ) : (
                    sortedPosts.map((post) => (
                      <tr
                        key={post._id}
                        onClick={() => router.push(`/client/online-store/blogs/posts/${post._id}`)}
                        className={`cursor-pointer border-b border-admin-border/70 transition-colors last:border-b-0 hover:bg-[#f6f6f7] ${
                          selectedIds.has(post._id) ? 'bg-[#f6f6f7]' : 'bg-white'
                        }`}
                      >
                        <td className="w-10 px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(post._id)}
                            onChange={(e) => {
                              setSelectedIds((prev) => {
                                const next = new Set(prev);
                                if (e.target.checked) next.add(post._id);
                                else next.delete(post._id);
                                return next;
                              });
                            }}
                            className="h-3.5 w-3.5 rounded border-[#8c9196]"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-admin-border bg-[#ebebeb]">
                              {post.featuredImageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={post.featuredImageUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <ImageIcon className="h-4 w-4 text-admin-text-subdued" />
                              )}
                            </div>
                            <span className="truncate text-[13px] font-semibold text-admin-text">{post.title}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <VisibilityBadge visibility={post.visibility} />
                        </td>
                        <td className="px-3 py-2.5 text-[13px] text-admin-text-secondary">{post.author || '—'}</td>
                        <td className="px-3 py-2.5 text-[13px] text-admin-text-secondary">
                          {post.blogId ? (
                            <Link
                              href={`/client/online-store/blogs/manage/${post.blogId}`}
                              onClick={(e) => e.stopPropagation()}
                              className={adminListFooterLinkClass}
                            >
                              {post.blogTitle || '—'}
                            </Link>
                          ) : (
                            post.blogTitle || '—'
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-[13px] text-admin-text-secondary">{formatRelativeUpdatedAt(post.updatedAt)}</td>
                        <td className="px-3 py-2.5 text-[13px] text-admin-text-secondary">
                          {post.visibility === 'visible' ? formatPublishedAt(post.createdAt) : ''}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!showEmptyState ? (
          <div className="py-5 text-center">
            <p className="text-xs text-admin-text-secondary">
              <Link href="/client/online-store/blogs/manage" className={adminListFooterLinkClass}>
                Manage blog containers
              </Link>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
