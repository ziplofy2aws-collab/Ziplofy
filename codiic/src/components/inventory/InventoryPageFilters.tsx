import {
  ArrowsUpDownIcon,
  MagnifyingGlassIcon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Location } from '../../contexts/location.context';
import {
  adminListFilterBarClass,
  adminListFilterChipClass,
  adminListSearchInputClass,
} from '../admin-list-ui';

interface InventoryPageFiltersProps {
  locations: Location[];
  selectedLocationId: string;
  onLocationChange: (locationId: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const InventoryPageFilters: React.FC<InventoryPageFiltersProps> = ({
  locations,
  selectedLocationId,
  onLocationChange,
  search,
  onSearchChange,
}) => {
  const [locationOpen, setLocationOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement | null>(null);

  const selectedLocationLabel = useMemo(() => {
    if (!selectedLocationId) return 'All';
    const location = locations.find((item) => item._id === selectedLocationId);
    return location?.name || 'All';
  }, [locations, selectedLocationId]);

  useEffect(() => {
    if (!locationOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setLocationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [locationOpen]);

  return (
    <div className={`relative z-40 shrink-0 ${adminListFilterBarClass}`}>
      <div className="relative shrink-0" ref={locationRef}>
        <button
          type="button"
          onClick={() => setLocationOpen((prev) => !prev)}
          className={adminListFilterChipClass}
        >
          {selectedLocationLabel}
          <ArrowsUpDownIcon className="h-3.5 w-3.5 text-admin-text-subdued" aria-hidden />
        </button>
        {locationOpen ? (
          <div className="absolute left-0 top-full z-50 mt-1 min-w-[180px] max-h-64 overflow-y-auto rounded-lg border border-admin-border bg-admin-surface py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            {locations.length === 0 ? (
              <p className="px-3 py-2 text-[13px] text-admin-text-secondary">No locations</p>
            ) : (
              locations.map((location) => (
                <button
                  key={location._id}
                  type="button"
                  onClick={() => {
                    onLocationChange(location._id);
                    setLocationOpen(false);
                  }}
                  className={`flex w-full items-center px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-admin-row-hover ${
                    selectedLocationId === location._id
                      ? 'bg-admin-row-hover font-medium text-admin-text'
                      : 'text-admin-text'
                  }`}
                >
                  {location.name}
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>

      <div className="relative min-w-0 flex-1">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-admin-text-subdued" />
        <input
          type="search"
          placeholder="Search and filter"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={!selectedLocationId}
          className={`${adminListSearchInputClass} disabled:cursor-not-allowed disabled:bg-admin-secondary disabled:text-admin-text-subdued`}
        />
      </div>

      <button
        type="button"
        aria-label="Edit columns"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-admin-border bg-admin-surface text-admin-text-secondary transition-colors hover:bg-admin-row-hover"
      >
        <ViewColumnsIcon className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
};

export default InventoryPageFilters;
