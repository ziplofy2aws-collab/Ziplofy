import { ArrowPathIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
  adminListFilterBarClass,
  adminListFilterChipClass,
  adminListSearchInputClass,
} from './admin-list-ui';

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
    <div className={adminListFilterBarClass}>
      <div className="relative min-w-0 flex-1">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-admin-text-subdued" />
        <input
          type="search"
          placeholder="Search in all markets"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className={adminListSearchInputClass}
        />
      </div>
      <button
        type="button"
        title="Filters"
        onClick={onFilterClick}
        className={adminListFilterChipClass}
      >
        <FunnelIcon className="h-3.5 w-3.5 text-admin-text-subdued" />
      </button>
      <button
        type="button"
        title="Refresh"
        onClick={onRefreshClick}
        className={adminListFilterChipClass}
      >
        <ArrowPathIcon className="h-3.5 w-3.5 text-admin-text-subdued" />
      </button>
    </div>
  );
}
