import {
  ArrowsUpDownIcon,
  ChevronDownIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  RectangleStackIcon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useRef, useState, type JSX } from 'react';
import { Link } from 'react-router-dom';

type ViewFilter = 'Custom' | 'All';

/** Placeholder until metaobject definitions API is connected. */
type MetaobjectDefinitionRow = {
  id: string;
  name: string;
  type: string;
};

const VIEW_FILTER_OPTIONS: ViewFilter[] = ['Custom', 'All'];

export default function MetaobjectsPage(): JSX.Element {
  const [viewFilter, setViewFilter] = useState<ViewFilter>('Custom');
  const [viewOpen, setViewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const viewRef = useRef<HTMLDivElement | null>(null);

  const definitions = useMemo<MetaobjectDefinitionRow[]>(() => [], []);

  useEffect(() => {
    if (!viewOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!viewRef.current?.contains(event.target as Node)) setViewOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [viewOpen]);

  const filteredDefinitions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let rows = [...definitions];

    if (viewFilter === 'Custom') {
      rows = rows.filter((row) => row.type === 'custom');
    }

    if (query) {
      rows = rows.filter((row) =>
        [row.name, row.type].join(' ').toLowerCase().includes(query)
      );
    }

    return rows;
  }, [definitions, searchQuery, viewFilter]);

  const showEmptyState = filteredDefinitions.length === 0;

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1000px] py-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <RectangleStackIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
            <h1 className="text-lg font-semibold text-gray-900">Metaobjects</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/settings/custom_data"
              className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50"
            >
              Manage
            </Link>
            <Link
              to="/settings/custom_data/metaobjects/create"
              className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
            >
              Add definition
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
            <div className="relative shrink-0" ref={viewRef}>
              <button
                type="button"
                onClick={() => setViewOpen((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50"
              >
                {viewFilter}
                <ArrowsUpDownIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden />
              </button>
              {viewOpen ? (
                <div className="absolute left-0 top-full z-20 mt-1 min-w-[140px] rounded-md border border-gray-200 bg-white py-1 shadow-md">
                  {VIEW_FILTER_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setViewFilter(option);
                        setViewOpen(false);
                      }}
                      className={`flex w-full items-center px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-gray-50 ${
                        viewFilter === option ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="relative min-w-0 flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Searching in metaobject definitions..."
                className="w-full rounded-md border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-[13px] font-normal text-gray-700 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
              />
            </div>

            <div className="flex shrink-0 items-center gap-1 border-l border-gray-200 pl-2">
              <button
                type="button"
                title="Edit columns"
                className="inline-flex items-center gap-0.5 rounded-md border border-gray-200 bg-white p-1.5 text-gray-500 transition-colors hover:bg-gray-50"
              >
                <ViewColumnsIcon className="h-3.5 w-3.5" aria-hidden />
                <ChevronDownIcon className="h-3 w-3 text-gray-400" aria-hidden />
              </button>
              <button
                type="button"
                title="Visibility"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50"
              >
                <EyeIcon className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </div>

          {showEmptyState ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
              <p className="text-[15px] font-semibold text-gray-900">No definitions found</p>
              <p className="mt-1.5 text-[13px] font-normal text-gray-500">
                Try changing the filters or search term
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Name</th>
                    <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDefinitions.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50/60"
                    >
                      <td className="px-3 py-2.5 text-[13px] font-medium text-gray-800">{row.name}</td>
                      <td className="px-3 py-2.5 text-[13px] font-normal text-gray-600">{row.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="py-5 text-center">
          <p className="text-xs text-gray-500">
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Learn more about metaobjects
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
