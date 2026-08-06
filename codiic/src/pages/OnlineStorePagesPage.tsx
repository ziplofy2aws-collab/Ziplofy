import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsUpDownIcon,
  Bars3BottomLeftIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  adminListTableHeadClass,
  adminListTableHeadRowClass,
} from '../components/admin-list-ui';
import StoreAccessRestrictedBanner from '../components/StoreAccessRestrictedBanner';
import { useStorePages } from '../contexts/store-page.context';
import { useStore } from '../contexts/store.context';

type SortField = 'title' | 'updated';
type SortOrder = 'asc' | 'desc';

const SORT_FIELD_LABELS: Record<SortField, string> = {
  title: 'Title',
  updated: 'Updated',
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

function VisibilityBadge({ visibility }: { visibility: 'visible' | 'hidden' }) {
  if (visibility === 'visible') {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[12px] font-medium text-emerald-700">
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
  const active = sortField === field;
  return (
    <button
      type="button"
      onClick={() => onColumnSort(field)}
      className={`group inline-flex items-center gap-1 text-[12px] font-medium leading-5 transition-colors hover:text-admin-text ${
        active ? 'text-admin-text' : 'text-admin-text-secondary'
      }`}
    >
      {label}
      {active ? (
        sortOrder === 'asc' ? (
          <ArrowUpIcon className="h-3 w-3" />
        ) : (
          <ArrowDownIcon className="h-3 w-3" />
        )
      ) : (
        <ArrowsUpDownIcon className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
      )}
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
    <div className="w-48 rounded-lg border border-admin-border bg-admin-surface py-2 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <p className="px-3 pb-1.5 text-[12px] font-medium text-admin-text-secondary">Sort by</p>
      {(Object.keys(SORT_FIELD_LABELS) as SortField[]).map((field) => (
        <label
          key={field}
          className="flex cursor-pointer items-center gap-2 px-3 py-1 text-[13px] text-admin-text hover:bg-admin-row-hover"
        >
          <input
            type="radio"
            name="pages-sort-field"
            checked={sortField === field}
            onChange={() => onSortFieldChange(field)}
            className="h-3.5 w-3.5 border-[#8c9196] text-admin-text focus:ring-[#005bd3]/30"
          />
          {SORT_FIELD_LABELS[field]}
        </label>
      ))}
      <div className="my-1.5 border-t border-admin-divider" />
      <button
        type="button"
        onClick={() => onSortOrderChange('asc')}
        className={`flex w-full items-center gap-2 px-3 py-1 text-left text-[13px] hover:bg-admin-row-hover ${
          sortOrder === 'asc' ? 'bg-admin-row-hover text-admin-text' : 'text-admin-text'
        }`}
      >
        <ArrowUpIcon className="h-3.5 w-3.5 text-admin-text-secondary" />
        Ascending
      </button>
      <button
        type="button"
        onClick={() => onSortOrderChange('desc')}
        className={`flex w-full items-center gap-2 px-3 py-1 text-left text-[13px] hover:bg-admin-row-hover ${
          sortOrder === 'desc' ? 'bg-admin-row-hover text-admin-text' : 'text-admin-text'
        }`}
      >
        <ArrowDownIcon className="h-3.5 w-3.5 text-admin-text-secondary" />
        Descending
      </button>
    </div>
  );
}

export default function OnlineStorePagesPage() {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { pages, loading, error, fetchPagesByStoreId } = useStorePages();
  const [sortField, setSortField] = useState<SortField>('updated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [sortOpen, setSortOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const sortRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!activeStoreId) return;
    void fetchPagesByStoreId(activeStoreId).catch(() => {
      // The context exposes the request error in the table.
    });
  }, [activeStoreId, fetchPagesByStoreId]);

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
          page.title.toLowerCase().includes(q) || page.content.toLowerCase().includes(q)
      );
    }
    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'title') {
        cmp = a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      } else {
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [pages, searchQuery, sortField, sortOrder]);

  const allVisibleSelected =
    filteredPages.length > 0 && filteredPages.every((page) => selectedIds.has(page._id));
  const someSelected = filteredPages.some((page) => selectedIds.has(page._id));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected && !allVisibleSelected;
    }
  }, [someSelected, allVisibleSelected]);

  const handleSelectAllVisible = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const page of filteredPages) {
        if (checked) next.add(page._id);
        else next.delete(page._id);
      }
      return next;
    });
  };

  const handleSelectRow = (pageId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(pageId);
      else next.delete(pageId);
      return next;
    });
  };

  const handleColumnSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderSortButton = () => (
    <div className="relative" ref={sortRef}>
      <button
        type="button"
        title="Sort"
        onClick={() => setSortOpen((v) => !v)}
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
            onSortFieldChange={setSortField}
            onSortOrderChange={setSortOrder}
          />
        </div>
      ) : null}
    </div>
  );

  return (
    <div className={adminListPageShellClass}>
      <div className={adminListPageInnerClass}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Pages</h1>
          </div>

          <Link to="/online-store/pages/new" className={adminListPrimaryButtonClass}>
            <PlusIcon className="mr-1.5 h-3.5 w-3.5" />
            Add page
          </Link>
        </div>

        <StoreAccessRestrictedBanner />

        <div className={adminListCardClass}>
          <div className={adminListFilterBarClass}>
            {searchOpen ? (
              <div className="flex w-full items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-admin-text-subdued" />
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
                  className="shrink-0 text-[13px] font-normal text-admin-text transition-colors hover:text-admin-text-secondary"
                >
                  Cancel
                </button>
                {renderSortButton()}
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
                    onClick={() => setSearchOpen(true)}
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
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className={adminListTableHeadRowClass}>
                  <th className="w-10 px-3 py-2 text-center">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={(e) => handleSelectAllVisible(e.target.checked)}
                      aria-label="Select all pages"
                      className="h-3.5 w-3.5 cursor-pointer rounded border-[#8c9196] text-admin-text focus:ring-[#005bd3]/30"
                    />
                  </th>
                  <th className={adminListTableHeadClass}>
                    <SortableColumnHeader
                      label="Title"
                      field="title"
                      sortField={sortField}
                      sortOrder={sortOrder}
                      onColumnSort={handleColumnSort}
                    />
                  </th>
                  <th className={adminListTableHeadClass}>Visibility</th>
                  <th className={adminListTableHeadClass}>Content</th>
                  <th className={`${adminListTableHeadClass} text-right`}>
                    <SortableColumnHeader
                      label="Updated"
                      field="updated"
                      sortField={sortField}
                      sortOrder={sortOrder}
                      onColumnSort={handleColumnSort}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && pages.length === 0 ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index} className="animate-pulse border-b border-admin-divider" aria-hidden>
                      <td className="w-10 px-3 py-2.5 text-center">
                        <div className="mx-auto h-3.5 w-3.5 rounded bg-admin-fill" />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="h-4 w-32 rounded bg-admin-fill" />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="h-5 w-16 rounded-full bg-admin-fill" />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="h-3.5 w-56 max-w-full rounded bg-admin-fill" />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="ml-auto h-3.5 w-24 rounded bg-admin-fill" />
                      </td>
                    </tr>
                  ))
                ) : error && pages.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-8 text-center text-[13px] font-normal text-red-600"
                    >
                      {error}
                    </td>
                  </tr>
                ) : filteredPages.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-8 text-center text-[13px] font-normal text-admin-text-secondary"
                    >
                      {searchQuery.trim() ? 'No pages match your search' : 'No pages yet'}
                    </td>
                  </tr>
                ) : (
                  filteredPages.map((page) => (
                    <tr
                      key={page._id}
                      onClick={() => navigate(`/online-store/pages/${page._id}`)}
                      className={`cursor-pointer border-b border-admin-divider bg-admin-surface transition-colors last:border-b-0 hover:bg-admin-row-hover ${
                        selectedIds.has(page._id) ? 'bg-admin-row-hover' : ''
                      }`}
                    >
                      <td className="w-10 px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(page._id)}
                          onChange={(e) => handleSelectRow(page._id, e.target.checked)}
                          aria-label={`Select page ${page.title}`}
                          className="h-3.5 w-3.5 cursor-pointer rounded border-[#8c9196] text-admin-text focus:ring-[#005bd3]/30"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="truncate text-[13px] font-semibold text-admin-text hover:text-[#005bd3]">
                          {page.title}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <VisibilityBadge visibility={page.visibility} />
                      </td>
                      <td className="max-w-[360px] px-3 py-2.5">
                        <span className="line-clamp-1 text-[13px] font-normal text-admin-text-secondary">
                          {page.content || ''}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right text-[13px] font-normal text-admin-text-secondary">
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
            Learn more about{' '}
            <a href="#" className={adminListFooterLinkClass}>
              pages
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
