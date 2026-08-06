import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsUpDownIcon,
  Bars3BottomLeftIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PhotoIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  adminListCardClass,
  adminListFilterBarClass,
  adminListFilterChipClass,
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListPrimaryButtonClass,
  adminListSearchInputClass,
  adminListSecondaryButtonClass,
  adminListTableHeadClass,
  adminListTableHeadRowClass,
} from '../components/admin-list-ui';
import StoreAccessRestrictedBanner from '../components/StoreAccessRestrictedBanner';
import { useBlogPosts } from '../contexts/blog-post.context';
import { useBlogTags } from '../contexts/blog-tags.context';
import { useBlogs } from '../contexts/blog.context';
import { useStore } from '../contexts/store.context';

type SortField = 'updated' | 'title' | 'blogTitle' | 'author' | 'published';
type SortOrder = 'asc' | 'desc';

interface BlogPostRow {
  id: string;
  title: string;
  visibility: 'visible' | 'hidden';
  author: string;
  blogId: string;
  blogTitle: string;
  tagIds: string[];
  tagNames: string[];
  featuredImageUrl: string;
  updatedAt: string;
  createdAt: string;
}

const SORT_FIELD_LABELS: Record<SortField, string> = {
  updated: 'Updated',
  title: 'Title',
  blogTitle: 'Blog title',
  author: 'Author',
  published: 'Published',
};

function formatRelativeUpdatedAt(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

    const isSameDay =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const time = date.toLocaleString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (isSameDay) return `Today at ${time.toLowerCase()}`;

    const dayName = date.toLocaleString(undefined, { weekday: 'long' });
    return `${dayName} at ${time.toLowerCase()}`;
  } catch {
    return iso;
  }
}

function formatPublishedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
    <span className="inline-flex items-center rounded-full bg-admin-secondary px-2 py-0.5 text-[12px] font-medium text-admin-text-secondary">
      Hidden
    </span>
  );
}

function BlogPostsEmptyIllustration() {
  return (
    <div className="relative mx-auto mb-6 flex h-36 w-36 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-admin-secondary" />
      <div className="absolute -top-1 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-md border border-admin-border bg-admin-surface px-2 py-1 shadow-sm">
        <span className="text-[10px] font-medium text-admin-text-secondary">B</span>
        <span className="text-[10px] font-normal text-admin-text-subdued">I</span>
        <span className="text-[10px] font-normal text-admin-text-subdued underline">U</span>
      </div>
      <div className="relative z-1 mt-2 h-[88px] w-[72px] rounded-md border border-admin-border bg-admin-surface shadow-sm">
        <div className="absolute -left-1 top-2 flex h-[72px] w-2 flex-col justify-between py-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-admin-fill" />
          ))}
        </div>
        <div className="p-2.5 pl-3">
          <div className="mb-1.5 h-7 w-full rounded-sm bg-admin-secondary" />
          <div className="space-y-1">
            <div className="h-1 w-full rounded bg-admin-secondary" />
            <div className="h-1 w-[85%] rounded bg-admin-secondary" />
            <div className="h-1 w-[70%] rounded bg-admin-secondary" />
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
        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
          active
            ? 'border-admin-border bg-admin-fill text-admin-text'
            : 'border-admin-border bg-admin-surface text-admin-text hover:bg-admin-row-hover'
        }`}
      >
        {valueLabel || label}
        <ChevronDownIcon className="h-3.5 w-3.5 text-admin-text-subdued" />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-30 mt-1 max-h-60 min-w-[180px] overflow-y-auto rounded-lg border border-admin-border bg-admin-surface py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
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
        selected
          ? 'bg-admin-row-hover font-medium text-admin-text'
          : 'text-admin-text hover:bg-admin-row-hover'
      }`}
    >
      {children}
    </button>
  );
}

function SortMenu({
  sortField,
  sortOrder,
  onSortFieldChange,
  onSortOrderChange,
}: {
  sortField: SortField;
  sortOrder: SortOrder;
  onSortFieldChange: (field: SortField) => void;
  onSortOrderChange: (order: SortOrder) => void;
}) {
  return (
    <div className="w-56 rounded-lg border border-admin-border bg-admin-surface py-2 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <p className="px-3 py-1.5 text-[13px] font-medium text-admin-text">Sort by</p>
      {(Object.keys(SORT_FIELD_LABELS) as SortField[]).map((field) => (
        <label
          key={field}
          className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-[13px] text-admin-text hover:bg-admin-row-hover"
        >
          <input
            type="radio"
            name="blog-post-sort-field"
            checked={sortField === field}
            onChange={() => onSortFieldChange(field)}
            className="h-3.5 w-3.5 border-[#8c9196] text-admin-text focus:ring-[#005bd3]/30"
          />
          {SORT_FIELD_LABELS[field]}
        </label>
      ))}

      <div className="my-2 border-t border-admin-divider" />

      <button
        type="button"
        onClick={() => onSortOrderChange('asc')}
        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors ${
          sortOrder === 'asc'
            ? 'bg-admin-row-hover text-admin-text'
            : 'text-admin-text hover:bg-admin-row-hover'
        }`}
      >
        <ArrowUpIcon className="h-3.5 w-3.5 text-admin-text-secondary" />
        Oldest first
      </button>
      <button
        type="button"
        onClick={() => onSortOrderChange('desc')}
        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors ${
          sortOrder === 'desc'
            ? 'bg-admin-row-hover text-admin-text'
            : 'text-admin-text hover:bg-admin-row-hover'
        }`}
      >
        <ArrowDownIcon className="h-3.5 w-3.5 text-admin-text-secondary" />
        Newest first
      </button>
    </div>
  );
}

function defaultSortOrderForPostField(field: SortField): SortOrder {
  return field === 'updated' || field === 'published' ? 'desc' : 'asc';
}

function SortableColumnHeader({
  label,
  field,
  sortField,
  sortOrder,
  onColumnSort,
}: {
  label: string;
  field: SortField;
  sortField: SortField;
  sortOrder: SortOrder;
  onColumnSort: (field: SortField) => void;
}) {
  const isActive = sortField === field;

  return (
    <button
      type="button"
      onClick={() => onColumnSort(field)}
      className={`inline-flex items-center gap-1 text-[12px] font-medium leading-5 transition-colors hover:text-admin-text ${
        isActive ? 'text-admin-text' : 'text-admin-text-secondary'
      }`}
    >
      {label}
      {isActive ? (
        <ChevronDownIcon
          className={`h-3.5 w-3.5 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
          aria-hidden
        />
      ) : null}
    </button>
  );
}

function comparePosts(a: BlogPostRow, b: BlogPostRow, field: SortField, order: SortOrder): number {
  const dir = order === 'asc' ? 1 : -1;

  switch (field) {
    case 'updated':
      return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
    case 'published': {
      const aTime = a.visibility === 'visible' ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.visibility === 'visible' ? new Date(b.createdAt).getTime() : 0;
      return (aTime - bTime) * dir;
    }
    case 'title':
      return a.title.localeCompare(b.title) * dir;
    case 'blogTitle':
      return a.blogTitle.localeCompare(b.blogTitle) * dir;
    case 'author':
      return a.author.localeCompare(b.author) * dir;
    default:
      return 0;
  }
}

function BlogPostsTable({
  posts,
  loading,
  selectedIds,
  selectAllRef,
  allVisibleSelected,
  sortField,
  sortOrder,
  searchOpen,
  searchQuery,
  visibilityFilter,
  tagFilter,
  blogFilter,
  authorFilter,
  blogs,
  blogTags,
  authors,
  sortOpen,
  onSearchOpenChange,
  onSearchQueryChange,
  onVisibilityFilterChange,
  onTagFilterChange,
  onBlogFilterChange,
  onAuthorFilterChange,
  onSortOpenChange,
  onSortFieldChange,
  onSortOrderChange,
  onColumnSort,
  onClearSearchAndFilters,
  onSelectAllVisible,
  onSelectRow,
  onPostClick,
}: {
  posts: BlogPostRow[];
  loading: boolean;
  selectedIds: Set<string>;
  selectAllRef: React.RefObject<HTMLInputElement | null>;
  allVisibleSelected: boolean;
  sortField: SortField;
  sortOrder: SortOrder;
  searchOpen: boolean;
  searchQuery: string;
  visibilityFilter: 'all' | 'visible' | 'hidden';
  tagFilter: string;
  blogFilter: string;
  authorFilter: string;
  blogs: Array<{ _id: string; title: string }>;
  blogTags: Array<{ _id: string; name: string }>;
  authors: string[];
  sortOpen: boolean;
  onSearchOpenChange: (open: boolean) => void;
  onSearchQueryChange: (value: string) => void;
  onVisibilityFilterChange: (value: 'all' | 'visible' | 'hidden') => void;
  onTagFilterChange: (value: string) => void;
  onBlogFilterChange: (value: string) => void;
  onAuthorFilterChange: (value: string) => void;
  onSortOpenChange: (open: boolean) => void;
  onSortFieldChange: (field: SortField) => void;
  onSortOrderChange: (order: SortOrder) => void;
  onColumnSort: (field: SortField) => void;
  onClearSearchAndFilters: () => void;
  onSelectAllVisible: (checked: boolean) => void;
  onSelectRow: (postId: string, checked: boolean) => void;
  onPostClick: (postId: string) => void;
}) {
  const sortRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sortOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!sortRef.current?.contains(event.target as Node)) onSortOpenChange(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sortOpen, onSortOpenChange]);

  const visibilityLabel =
    visibilityFilter === 'all'
      ? 'Visibility'
      : visibilityFilter === 'visible'
        ? 'Visible'
        : 'Hidden';

  const tagLabel =
    tagFilter === 'all'
      ? 'Tagged with'
      : (blogTags.find((tag) => tag._id === tagFilter)?.name ?? 'Tagged with');

  const blogLabel =
    blogFilter === 'all'
      ? 'Blog'
      : (blogs.find((blog) => blog._id === blogFilter)?.title ?? 'Blog');

  const authorLabel = authorFilter === 'all' ? 'Author' : authorFilter;

  const renderSortButton = () => (
    <div className="relative" ref={sortRef}>
      <button
        type="button"
        title="Sort"
        onClick={() => onSortOpenChange(!sortOpen)}
        className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border bg-admin-surface text-admin-text-secondary transition-colors hover:bg-admin-row-hover ${
          sortOpen ? 'border-admin-border bg-admin-row-hover' : 'border-admin-border'
        }`}
      >
        <ArrowsUpDownIcon className="h-3.5 w-3.5" />
      </button>
      {sortOpen ? (
        <div className="absolute right-0 top-full z-30 mt-1">
          <SortMenu
            sortField={sortField}
            sortOrder={sortOrder}
            onSortFieldChange={onSortFieldChange}
            onSortOrderChange={onSortOrderChange}
          />
        </div>
      ) : null}
    </div>
  );

  return (
    <div className={adminListCardClass}>
      <div className={adminListFilterBarClass} ref={toolbarRef}>
        {searchOpen ? (
          <div className="flex w-full flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-admin-text-subdued" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  placeholder="Searching all blog posts"
                  autoFocus
                  className={adminListSearchInputClass}
                />
              </div>
              <button
                type="button"
                onClick={onClearSearchAndFilters}
                className="shrink-0 text-[13px] font-normal text-admin-text transition-colors hover:text-admin-text-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled
                className="shrink-0 cursor-not-allowed text-[13px] font-normal text-admin-text-subdued"
              >
                Save as
              </button>
              {renderSortButton()}
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterDropdown
                label="Visibility"
                valueLabel={visibilityLabel}
                active={visibilityFilter !== 'all'}
              >
                {(close) => (
                  <>
                    <FilterOption
                      selected={visibilityFilter === 'all'}
                      onClick={() => {
                        onVisibilityFilterChange('all');
                        close();
                      }}
                    >
                      All
                    </FilterOption>
                    <FilterOption
                      selected={visibilityFilter === 'visible'}
                      onClick={() => {
                        onVisibilityFilterChange('visible');
                        close();
                      }}
                    >
                      Visible
                    </FilterOption>
                    <FilterOption
                      selected={visibilityFilter === 'hidden'}
                      onClick={() => {
                        onVisibilityFilterChange('hidden');
                        close();
                      }}
                    >
                      Hidden
                    </FilterOption>
                  </>
                )}
              </FilterDropdown>

              <FilterDropdown label="Tagged with" valueLabel={tagLabel} active={tagFilter !== 'all'}>
                {(close) => (
                  <>
                    <FilterOption
                      selected={tagFilter === 'all'}
                      onClick={() => {
                        onTagFilterChange('all');
                        close();
                      }}
                    >
                      All
                    </FilterOption>
                    {blogTags.map((tag) => (
                      <FilterOption
                        key={tag._id}
                        selected={tagFilter === tag._id}
                        onClick={() => {
                          onTagFilterChange(tag._id);
                          close();
                        }}
                      >
                        {tag.name}
                      </FilterOption>
                    ))}
                  </>
                )}
              </FilterDropdown>

              <FilterDropdown label="Blog" valueLabel={blogLabel} active={blogFilter !== 'all'}>
                {(close) => (
                  <>
                    <FilterOption
                      selected={blogFilter === 'all'}
                      onClick={() => {
                        onBlogFilterChange('all');
                        close();
                      }}
                    >
                      All
                    </FilterOption>
                    {blogs.map((blog) => (
                      <FilterOption
                        key={blog._id}
                        selected={blogFilter === blog._id}
                        onClick={() => {
                          onBlogFilterChange(blog._id);
                          close();
                        }}
                      >
                        {blog.title}
                      </FilterOption>
                    ))}
                  </>
                )}
              </FilterDropdown>

              <FilterDropdown label="Author" valueLabel={authorLabel} active={authorFilter !== 'all'}>
                {(close) => (
                  <>
                    <FilterOption
                      selected={authorFilter === 'all'}
                      onClick={() => {
                        onAuthorFilterChange('all');
                        close();
                      }}
                    >
                      All
                    </FilterOption>
                    {authors.map((author) => (
                      <FilterOption
                        key={author}
                        selected={authorFilter === author}
                        onClick={() => {
                          onAuthorFilterChange(author);
                          close();
                        }}
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
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button type="button" className={adminListFilterChipClass}>
                All
              </button>
              <button
                type="button"
                title="Create view"
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-admin-border bg-admin-surface text-admin-text-secondary transition-colors hover:bg-admin-row-hover"
              >
                <PlusIcon className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                title="Search and filter"
                onClick={() => onSearchOpenChange(true)}
                className="inline-flex h-7 items-center gap-1 rounded-lg border border-admin-border bg-admin-surface px-2 text-admin-text-secondary transition-colors hover:bg-admin-row-hover"
              >
                <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                <Bars3BottomLeftIcon className="h-3.5 w-3.5" />
              </button>
              {renderSortButton()}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left">
          <thead>
            <tr className={adminListTableHeadRowClass}>
              <th className="w-10 px-3 py-2 text-center">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={(e) => onSelectAllVisible(e.target.checked)}
                  aria-label="Select all blog posts"
                  className="h-3.5 w-3.5 cursor-pointer rounded border-[#8c9196] text-admin-text focus:ring-[#005bd3]/30"
                />
              </th>
              <th className={adminListTableHeadClass}>
                <SortableColumnHeader
                  label="Title"
                  field="title"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onColumnSort={onColumnSort}
                />
              </th>
              <th className={adminListTableHeadClass}>Visibility</th>
              <th className={adminListTableHeadClass}>
                <SortableColumnHeader
                  label="Author"
                  field="author"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onColumnSort={onColumnSort}
                />
              </th>
              <th className={adminListTableHeadClass}>
                <SortableColumnHeader
                  label="Blog"
                  field="blogTitle"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onColumnSort={onColumnSort}
                />
              </th>
              <th className={adminListTableHeadClass}>
                <SortableColumnHeader
                  label="Updated"
                  field="updated"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onColumnSort={onColumnSort}
                />
              </th>
              <th className={adminListTableHeadClass}>
                <SortableColumnHeader
                  label="Published"
                  field="published"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onColumnSort={onColumnSort}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && posts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-[13px] font-normal text-admin-text-secondary"
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-admin-border border-t-admin-text" />
                    Loading blog posts…
                  </span>
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-[13px] font-normal text-admin-text-secondary"
                >
                  No blog posts found
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr
                  key={post.id}
                  onClick={() => onPostClick(post.id)}
                  className={`cursor-pointer border-b border-admin-divider transition-colors last:border-b-0 ${
                    selectedIds.has(post.id)
                      ? 'bg-admin-row-hover'
                      : 'bg-admin-surface hover:bg-admin-row-hover'
                  }`}
                >
                  <td
                    className="w-10 px-3 py-2.5 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(post.id)}
                      onChange={(e) => onSelectRow(post.id, e.target.checked)}
                      aria-label={`Select blog post ${post.title}`}
                      className="h-3.5 w-3.5 cursor-pointer rounded border-[#8c9196] text-admin-text focus:ring-[#005bd3]/30"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-admin-border bg-admin-secondary">
                        {post.featuredImageUrl ? (
                          <img
                            src={post.featuredImageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <PhotoIcon className="h-4 w-4 text-admin-text-subdued" aria-hidden />
                        )}
                      </div>
                      <span className="truncate text-[13px] font-semibold text-admin-text">
                        {post.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <VisibilityBadge visibility={post.visibility} />
                  </td>
                  <td className="px-3 py-2.5 text-[13px] font-normal text-admin-text-secondary">
                    {post.author}
                  </td>
                  <td className="px-3 py-2.5 text-[13px] font-normal text-admin-text-secondary">
                    {post.blogId ? (
                      <Link
                        to={`/content/blogs/${post.blogId}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`${adminListFooterLinkClass}`}
                      >
                        {post.blogTitle}
                      </Link>
                    ) : (
                      post.blogTitle
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[13px] font-normal text-admin-text-secondary">
                    {formatRelativeUpdatedAt(post.updatedAt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[13px] font-normal text-admin-text-secondary">
                    {post.visibility === 'visible' ? formatPublishedAt(post.createdAt) : ''}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const ContentBlogPostsPage = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { blogs, fetchBlogsByStoreId } = useBlogs();
  const { blogTags, fetchBlogTagsByStoreId } = useBlogTags();
  const { blogPosts, loading, fetchBlogPostsByStoreId } = useBlogPosts();

  const [sortField, setSortField] = useState<SortField>('updated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [sortOpen, setSortOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [blogFilter, setBlogFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!activeStoreId) return;
    void fetchBlogPostsByStoreId(activeStoreId);
    void fetchBlogsByStoreId(activeStoreId);
    void fetchBlogTagsByStoreId(activeStoreId);
  }, [activeStoreId, fetchBlogPostsByStoreId, fetchBlogsByStoreId, fetchBlogTagsByStoreId]);

  const tagNameById = useMemo(() => {
    return new Map(blogTags.map((tag) => [tag._id, tag.name]));
  }, [blogTags]);

  const blogTitleById = useMemo(() => {
    return new Map(blogs.map((blog) => [blog._id, blog.title]));
  }, [blogs]);

  const allRows = useMemo<BlogPostRow[]>(() => {
    return blogPosts.map((post) => ({
      id: post._id,
      title: post.title,
      visibility: post.visibility,
      author: post.author || '—',
      blogId: post.blogId,
      blogTitle: blogTitleById.get(post.blogId) ?? '—',
      tagIds: post.tagIds ?? [],
      tagNames: (post.tagIds ?? [])
        .map((id) => tagNameById.get(id))
        .filter((name): name is string => Boolean(name)),
      featuredImageUrl: post.featuredImageUrl,
      updatedAt: post.updatedAt,
      createdAt: post.createdAt,
    }));
  }, [blogPosts, blogTitleById, tagNameById]);

  const authors = useMemo(() => {
    const unique = new Set<string>();
    for (const row of allRows) {
      if (row.author && row.author !== '—') unique.add(row.author);
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [allRows]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allRows.filter((post) => {
      if (visibilityFilter !== 'all' && post.visibility !== visibilityFilter) return false;
      if (blogFilter !== 'all' && post.blogId !== blogFilter) return false;
      if (authorFilter !== 'all' && post.author !== authorFilter) return false;
      if (tagFilter !== 'all' && !post.tagIds.includes(tagFilter)) return false;

      if (q) {
        const haystack = [
          post.title,
          post.author,
          post.blogTitle,
          ...post.tagNames,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [allRows, searchQuery, visibilityFilter, blogFilter, authorFilter, tagFilter]);

  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => comparePosts(a, b, sortField, sortOrder));
  }, [filteredPosts, sortField, sortOrder]);

  const visibleIds = useMemo(() => sortedPosts.map((post) => post.id), [sortedPosts]);
  const selectedVisibleCount = useMemo(
    () => visibleIds.filter((id) => selectedIds.has(id)).length,
    [visibleIds, selectedIds]
  );
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected]);

  const handleSelectRow = (postId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(postId);
      else next.delete(postId);
      return next;
    });
  };

  const handleSelectAllVisible = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) visibleIds.forEach((id) => next.add(id));
      else visibleIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleClearSearchAndFilters = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery('');
    setVisibilityFilter('all');
    setTagFilter('all');
    setBlogFilter('all');
    setAuthorFilter('all');
  }, []);

  const handleColumnSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        return;
      }
      setSortField(field);
      setSortOrder(defaultSortOrderForPostField(field));
    },
    [sortField]
  );

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    visibilityFilter !== 'all' ||
    tagFilter !== 'all' ||
    blogFilter !== 'all' ||
    authorFilter !== 'all';

  const showEmptyState = !loading && allRows.length === 0;

  return (
    <div className={adminListPageShellClass}>
      <div className={adminListPageInnerClass}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PencilSquareIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Blog posts</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link to="/content/blogs" className={adminListSecondaryButtonClass}>
              <PencilSquareIcon className="mr-1.5 h-3.5 w-3.5" />
              Manage blogs
            </Link>
            {!showEmptyState ? (
              <button
                type="button"
                onClick={() => navigate('/content/articles/new')}
                className={adminListPrimaryButtonClass}
              >
                <PlusIcon className="mr-1.5 h-3.5 w-3.5" />
                Create blog post
              </button>
            ) : null}
          </div>
        </div>

        <StoreAccessRestrictedBanner />

        {showEmptyState ? (
          <div className={adminListCardClass}>
            <div className="flex min-h-[420px] flex-col items-center justify-center bg-admin-surface px-6 py-14 text-center">
              <BlogPostsEmptyIllustration />
              <h2 className="text-[15px] font-semibold text-admin-text">Write a blog post</h2>
              <p className="mt-1.5 max-w-md text-[13px] font-normal leading-relaxed text-admin-text-secondary">
                Blog posts are a great way to build a community around your products and your brand.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button type="button" className={adminListSecondaryButtonClass}>
                  Learn more
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/content/articles/new')}
                  className={adminListPrimaryButtonClass}
                >
                  Create blog post
                </button>
              </div>
            </div>
          </div>
        ) : (
          <BlogPostsTable
            posts={sortedPosts}
            loading={loading}
            selectedIds={selectedIds}
            selectAllRef={selectAllRef}
            allVisibleSelected={allVisibleSelected}
            sortField={sortField}
            sortOrder={sortOrder}
            searchOpen={searchOpen || hasActiveFilters}
            searchQuery={searchQuery}
            visibilityFilter={visibilityFilter}
            tagFilter={tagFilter}
            blogFilter={blogFilter}
            authorFilter={authorFilter}
            blogs={blogs}
            blogTags={blogTags}
            authors={authors}
            sortOpen={sortOpen}
            onSearchOpenChange={setSearchOpen}
            onSearchQueryChange={setSearchQuery}
            onVisibilityFilterChange={setVisibilityFilter}
            onTagFilterChange={setTagFilter}
            onBlogFilterChange={setBlogFilter}
            onAuthorFilterChange={setAuthorFilter}
            onSortOpenChange={setSortOpen}
            onSortFieldChange={setSortField}
            onSortOrderChange={setSortOrder}
            onColumnSort={handleColumnSort}
            onClearSearchAndFilters={handleClearSearchAndFilters}
            onSelectAllVisible={handleSelectAllVisible}
            onSelectRow={handleSelectRow}
            onPostClick={(postId) => navigate(`/content/articles/${postId}`)}
          />
        )}

        {!showEmptyState ? (
          <div className="py-5 text-center">
            <p className="text-xs text-admin-text-secondary">
              <a href="#" className={adminListFooterLinkClass}>
                Learn more about blog posts
              </a>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
