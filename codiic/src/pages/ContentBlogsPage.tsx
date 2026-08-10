import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsUpDownIcon,
  Bars3BottomLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
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
  adminListTableCellClass,
  adminListTableHeadClass,
  adminListTableHeadRowClass,
} from '../components/admin-list-ui';
import {
  BLOG_COMMENTS_MODES,
  formatBlogCommentsLabel,
  useBlogs,
  type BlogCommentsMode,
} from '../contexts/blog.context';
import { useStore } from '../contexts/store.context';

type SortField = 'title' | 'comments' | 'updated';
type SortOrder = 'asc' | 'desc';

interface BlogRow {
  id: string;
  title: string;
  commentsMode: BlogCommentsMode;
  commentsLabel: string;
  urlHandle: string;
  updatedAt: string;
}

const SORT_FIELD_LABELS: Record<SortField, string> = {
  title: 'Title',
  comments: 'Comments',
  updated: 'Updated',
};

const COMMENTS_FILTER_LABELS: Record<BlogCommentsMode, string> = {
  disabled: 'Disabled',
  moderated: 'Allowed, pending moderation',
  allowed: 'Allowed',
};

const checkboxClass =
  'h-3.5 w-3.5 cursor-pointer rounded border-[#8c9196] text-admin-text focus:ring-[#005bd3]/30';

function formatBlogUpdatedAt(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
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
            ? 'border-admin-border bg-admin-fill text-admin-text'
            : 'border-admin-border bg-admin-surface text-admin-text hover:bg-admin-row-hover'
        }`}
      >
        {valueLabel || label}
        <ChevronDownIcon className="h-3.5 w-3.5 text-admin-text-subdued" />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-30 mt-1 max-h-60 min-w-[180px] overflow-y-auto rounded-xl border border-admin-border bg-admin-surface py-1 shadow-lg">
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
    <div className="w-56 rounded-xl border border-admin-border bg-admin-surface py-2 shadow-lg">
      <p className="px-3 py-1.5 text-[13px] font-medium text-admin-text">Sort by</p>
      {(Object.keys(SORT_FIELD_LABELS) as SortField[]).map((field) => (
        <label
          key={field}
          className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-[13px] text-admin-text hover:bg-admin-row-hover"
        >
          <input
            type="radio"
            name="blog-sort-field"
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

function defaultSortOrderForBlogField(field: SortField): SortOrder {
  return field === 'updated' ? 'desc' : 'asc';
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
      className={`inline-flex items-center gap-1 text-[12px] font-medium transition-colors hover:text-admin-text ${
        isActive ? 'text-admin-text' : 'text-[#616161]'
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

function compareBlogs(a: BlogRow, b: BlogRow, field: SortField, order: SortOrder): number {
  const dir = order === 'asc' ? 1 : -1;

  switch (field) {
    case 'updated':
      return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
    case 'title':
      return a.title.localeCompare(b.title) * dir;
    case 'comments':
      return a.commentsLabel.localeCompare(b.commentsLabel) * dir;
    default:
      return 0;
  }
}

function BlogsTable({
  rows,
  loading,
  selectedIds,
  selectAllRef,
  allVisibleSelected,
  sortField,
  sortOrder,
  searchOpen,
  searchQuery,
  commentsFilter,
  sortOpen,
  onSearchOpenChange,
  onSearchQueryChange,
  onCommentsFilterChange,
  onSortOpenChange,
  onSortFieldChange,
  onSortOrderChange,
  onColumnSort,
  onClearSearchAndFilters,
  onSelectAllVisible,
  onSelectRow,
  onBlogClick,
}: {
  rows: BlogRow[];
  loading: boolean;
  selectedIds: Set<string>;
  selectAllRef: React.RefObject<HTMLInputElement | null>;
  allVisibleSelected: boolean;
  sortField: SortField;
  sortOrder: SortOrder;
  searchOpen: boolean;
  searchQuery: string;
  commentsFilter: 'all' | BlogCommentsMode;
  sortOpen: boolean;
  onSearchOpenChange: (open: boolean) => void;
  onSearchQueryChange: (value: string) => void;
  onCommentsFilterChange: (value: 'all' | BlogCommentsMode) => void;
  onSortOpenChange: (open: boolean) => void;
  onSortFieldChange: (field: SortField) => void;
  onSortOrderChange: (order: SortOrder) => void;
  onColumnSort: (field: SortField) => void;
  onClearSearchAndFilters: () => void;
  onSelectAllVisible: (checked: boolean) => void;
  onSelectRow: (blogId: string, checked: boolean) => void;
  onBlogClick: (blogId: string) => void;
}) {
  const sortRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sortOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!sortRef.current?.contains(event.target as Node)) onSortOpenChange(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sortOpen, onSortOpenChange]);

  const commentsLabel =
    commentsFilter === 'all' ? 'Comments' : COMMENTS_FILTER_LABELS[commentsFilter];

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
      <div className={adminListFilterBarClass}>
        {searchOpen ? (
          <div className="flex w-full flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-admin-text-subdued" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  placeholder="Searching all blogs"
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
                label="Comments"
                valueLabel={commentsLabel}
                active={commentsFilter !== 'all'}
              >
                {(close) => (
                  <>
                    <FilterOption
                      selected={commentsFilter === 'all'}
                      onClick={() => {
                        onCommentsFilterChange('all');
                        close();
                      }}
                    >
                      All
                    </FilterOption>
                    {BLOG_COMMENTS_MODES.map((mode) => (
                      <FilterOption
                        key={mode}
                        selected={commentsFilter === mode}
                        onClick={() => {
                          onCommentsFilterChange(mode);
                          close();
                        }}
                      >
                        {COMMENTS_FILTER_LABELS[mode]}
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
        <table className="w-full min-w-[520px] text-left">
          <thead>
            <tr className={adminListTableHeadRowClass}>
              <th className="w-10 px-3 py-2 text-center">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={(e) => onSelectAllVisible(e.target.checked)}
                  aria-label="Select all blogs"
                  className={checkboxClass}
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
              <th className={adminListTableHeadClass}>
                <SortableColumnHeader
                  label="Comments"
                  field="comments"
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
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-8 text-center text-[13px] text-admin-text-secondary"
                >
                  Loading blogs…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-8 text-center text-[13px] text-admin-text-secondary"
                >
                  No blogs found
                </td>
              </tr>
            ) : (
              rows.map((blog) => (
                <tr
                  key={blog.id}
                  onClick={() => onBlogClick(blog.id)}
                  className={`cursor-pointer border-b border-admin-divider transition-colors last:border-b-0 ${
                    selectedIds.has(blog.id)
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
                      checked={selectedIds.has(blog.id)}
                      onChange={(e) => onSelectRow(blog.id, e.target.checked)}
                      aria-label={`Select blog ${blog.title}`}
                      className={checkboxClass}
                    />
                  </td>
                  <td className="px-3 py-2.5 text-[13px] font-medium text-admin-text">
                    <Link
                      to={`/content/blogs/${blog.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-admin-text hover:text-[#005bd3]"
                    >
                      {blog.title}
                    </Link>
                  </td>
                  <td className={adminListTableCellClass}>{blog.commentsLabel}</td>
                  <td className={adminListTableCellClass}>
                    {formatBlogUpdatedAt(blog.updatedAt)}
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

export const ContentBlogsPage = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { blogs, loading, fetchBlogsByStoreId } = useBlogs();

  const [sortField, setSortField] = useState<SortField>('updated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [sortOpen, setSortOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [commentsFilter, setCommentsFilter] = useState<'all' | BlogCommentsMode>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!activeStoreId) return;
    void fetchBlogsByStoreId(activeStoreId);
  }, [activeStoreId, fetchBlogsByStoreId]);

  const allRows = useMemo<BlogRow[]>(() => {
    return blogs.map((blog) => ({
      id: blog._id,
      title: blog.title,
      commentsMode: blog.comments,
      commentsLabel: formatBlogCommentsLabel(blog.comments),
      urlHandle: blog.urlHandle,
      updatedAt: blog.updatedAt,
    }));
  }, [blogs]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allRows.filter((row) => {
      if (commentsFilter !== 'all' && row.commentsMode !== commentsFilter) return false;

      if (q) {
        const haystack = [row.title, row.commentsLabel, row.urlHandle].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [allRows, searchQuery, commentsFilter]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => compareBlogs(a, b, sortField, sortOrder));
  }, [filteredRows, sortField, sortOrder]);

  const visibleIds = useMemo(() => sortedRows.map((row) => row.id), [sortedRows]);
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

  const handleSelectRow = (blogId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(blogId);
      else next.delete(blogId);
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
    setCommentsFilter('all');
  }, []);

  const handleColumnSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        return;
      }
      setSortField(field);
      setSortOrder(defaultSortOrderForBlogField(field));
    },
    [sortField]
  );

  const hasActiveFilters = searchQuery.trim().length > 0 || commentsFilter !== 'all';

  return (
    <div className={adminListPageShellClass}>
      <div className={`${adminListPageInnerClass} py-5`}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <nav className="flex min-w-0 items-center gap-1.5 text-[13px]" aria-label="Breadcrumb">
            <Link
              to="/content/articles"
              className={`inline-flex items-center gap-1 font-medium ${adminListFooterLinkClass}`}
            >
              <PencilSquareIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Blog posts
            </Link>
            <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-admin-text-subdued" aria-hidden />
            <span className="truncate font-medium text-admin-text">Manage blogs</span>
          </nav>

          <Link to="/content/blogs/new" className={adminListPrimaryButtonClass}>
            <PlusIcon className="mr-1.5 h-3.5 w-3.5" />
            Add blog
          </Link>
        </div>

        <BlogsTable
          rows={sortedRows}
          loading={loading}
          selectedIds={selectedIds}
          selectAllRef={selectAllRef}
          allVisibleSelected={allVisibleSelected}
          sortField={sortField}
          sortOrder={sortOrder}
          searchOpen={searchOpen || hasActiveFilters}
          searchQuery={searchQuery}
          commentsFilter={commentsFilter}
          sortOpen={sortOpen}
          onSearchOpenChange={setSearchOpen}
          onSearchQueryChange={setSearchQuery}
          onCommentsFilterChange={setCommentsFilter}
          onSortOpenChange={setSortOpen}
          onSortFieldChange={setSortField}
          onSortOrderChange={setSortOrder}
          onColumnSort={handleColumnSort}
          onClearSearchAndFilters={handleClearSearchAndFilters}
          onSelectAllVisible={handleSelectAllVisible}
          onSelectRow={handleSelectRow}
          onBlogClick={(blogId) => navigate(`/content/blogs/${blogId}`)}
        />

        <div className="py-5 text-center">
          <p className="text-[12px] text-admin-text-secondary">
            <a href="#" className={adminListFooterLinkClass}>
              Blogs
            </a>{' '}
            are a great way to build a community around your products and your brand.
          </p>
        </div>
      </div>
    </div>
  );
};
