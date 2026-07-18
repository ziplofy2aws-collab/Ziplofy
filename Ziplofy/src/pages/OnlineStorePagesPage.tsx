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
    <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[12px] font-medium text-sky-700">
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
      className={`group inline-flex items-center gap-1 text-xs font-normal transition-colors ${
        active ? 'text-gray-800' : 'text-gray-500 hover:text-gray-700'
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
    <div className="w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
      <p className="px-3 pb-1.5 text-[12px] font-medium text-gray-500">Sort by</p>
      {(Object.keys(SORT_FIELD_LABELS) as SortField[]).map((field) => (
        <label
          key={field}
          className="flex cursor-pointer items-center gap-2 px-3 py-1 text-[13px] text-gray-700 hover:bg-gray-50"
        >
          <input
            type="radio"
            name="pages-sort-field"
            checked={sortField === field}
            onChange={() => onSortFieldChange(field)}
            className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500/30"
          />
          {SORT_FIELD_LABELS[field]}
        </label>
      ))}
      <div className="my-1.5 border-t border-gray-100" />
      <button
        type="button"
        onClick={() => onSortOrderChange('asc')}
        className={`flex w-full items-center gap-2 px-3 py-1 text-left text-[13px] hover:bg-gray-50 ${
          sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-700'
        }`}
      >
        <ArrowUpIcon className="h-3.5 w-3.5" />
        Ascending
      </button>
      <button
        type="button"
        onClick={() => onSortOrderChange('desc')}
        className={`flex w-full items-center gap-2 px-3 py-1 text-left text-[13px] hover:bg-gray-50 ${
          sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-700'
        }`}
      >
        <ArrowDownIcon className="h-3.5 w-3.5" />
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
        className={`inline-flex h-7 w-7 items-center justify-center rounded-md border bg-white text-gray-500 transition-colors hover:bg-gray-50 ${
          sortOpen ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
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
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-4">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
            <h1 className="text-lg font-medium text-gray-900">Pages</h1>
          </div>

          <Link
            to="/online-store/pages/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-blue-700"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Add page
          </Link>
        </div>

        <StoreAccessRestrictedBanner />

        <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-3 py-2">
            {searchOpen ? (
              <div className="flex items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Searching all pages"
                    autoFocus
                    className="w-full rounded-md border border-blue-500 py-1.5 pl-8 pr-3 text-[13px] font-normal text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="shrink-0 text-[13px] font-normal text-gray-800 transition-colors hover:text-gray-600"
                >
                  Cancel
                </button>
                {renderSortButton()}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-[13px] font-normal text-gray-700"
                  >
                    All
                  </button>
                  <button
                    type="button"
                    title="Create view"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Search and filter"
                    onClick={() => setSearchOpen(true)}
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 text-gray-500 transition-colors hover:bg-gray-50"
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
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="w-10 px-3 py-2 text-center">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={(e) => handleSelectAllVisible(e.target.checked)}
                      aria-label="Select all pages"
                      className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
                    />
                  </th>
                  <th className="px-3 py-2">
                    <SortableColumnHeader
                      label="Title"
                      field="title"
                      sortField={sortField}
                      sortOrder={sortOrder}
                      onColumnSort={handleColumnSort}
                    />
                  </th>
                  <th className="px-3 py-2 text-xs font-normal text-gray-500">Visibility</th>
                  <th className="px-3 py-2 text-xs font-normal text-gray-500">Content</th>
                  <th className="px-3 py-2 text-right">
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
              <tbody className="divide-y divide-gray-100">
                {loading && pages.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-8 text-center text-[13px] font-normal text-gray-500"
                    >
                      Loading pages…
                    </td>
                  </tr>
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
                      className="px-3 py-8 text-center text-[13px] font-normal text-gray-500"
                    >
                      {searchQuery.trim() ? 'No pages match your search' : 'No pages yet'}
                    </td>
                  </tr>
                ) : (
                  filteredPages.map((page) => (
                    <tr
                      key={page._id}
                      onClick={() => navigate(`/online-store/pages/${page._id}`)}
                      className={`cursor-pointer transition-colors ${
                        selectedIds.has(page._id) ? 'bg-gray-50' : 'hover:bg-gray-50/80'
                      }`}
                    >
                      <td className="w-10 px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(page._id)}
                          onChange={(e) => handleSelectRow(page._id, e.target.checked)}
                          aria-label={`Select page ${page.title}`}
                          className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="truncate text-[13px] font-semibold text-gray-800 hover:text-blue-600">
                          {page.title}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <VisibilityBadge visibility={page.visibility} />
                      </td>
                      <td className="max-w-[360px] px-3 py-2.5">
                        <span className="line-clamp-1 text-[13px] font-normal text-gray-500">
                          {page.content || ''}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right text-[13px] font-normal text-gray-600">
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
          <p className="text-xs text-gray-500">
            Learn more about{' '}
            <a href="#" className="text-gray-700 underline hover:text-blue-700">
              pages
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
