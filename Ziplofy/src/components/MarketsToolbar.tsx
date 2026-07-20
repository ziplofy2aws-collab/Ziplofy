import { ArrowPathIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface MarketsToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  onRefreshClick?: () => void;
}

const noop = () => {};

export default function MarketsToolbar({
  searchValue = '',
  onSearchChange = noop,
  onFilterClick = noop,
  onRefreshClick = noop,
}: MarketsToolbarProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm px-3 py-2.5 mb-6 flex items-center gap-2">
      <div className="relative flex-1 min-w-0">
        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search in all markets"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm transition-colors"
        />
      </div>
      <button
        type="button"
        title="Filters"
        onClick={onFilterClick}
        className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-500 transition-colors"
      >
        <FunnelIcon className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Refresh"
        onClick={onRefreshClick}
        className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-500 transition-colors"
      >
        <ArrowPathIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

