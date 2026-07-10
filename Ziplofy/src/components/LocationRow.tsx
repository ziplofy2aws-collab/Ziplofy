import React, { useCallback } from 'react';
import { BuildingStorefrontIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface LocationRowProps {
  location: {
    _id: string;
    name: string;
    address?: string;
    apartment?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    countryRegion?: string;
    isActive: boolean;
  };
  isDefault: boolean;
  onLocationClick: (locationId: string) => void;
}

const LocationRow: React.FC<LocationRowProps> = ({ location, isDefault, onLocationClick }) => {
  const handleClick = useCallback(() => {
    onLocationClick(location._id);
  }, [location._id, onLocationClick]);

  const addressLine = [
    location.address,
    location.apartment,
    location.city,
    location.state,
    location.postalCode,
    location.countryRegion,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-blue-50/50 sm:px-5"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-slate-50/80 text-slate-600 transition-colors group-hover:border-blue-200/80 group-hover:bg-blue-50/60 group-hover:text-blue-700">
          <BuildingStorefrontIcon className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{location.name}</p>
          {isDefault && (
            <span className="inline-flex items-center rounded-md border border-blue-200/80 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">
              Default
            </span>
          )}
        </div>
        {addressLine ? (
          <p className="mt-0.5 truncate text-sm text-gray-500 sm:whitespace-normal">{addressLine}</p>
        ) : (
          <p className="mt-0.5 text-sm italic text-gray-400">No address on file</p>
        )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
            location.isActive
              ? 'border border-emerald-200/80 bg-emerald-50 text-emerald-800'
              : 'border border-slate-200 bg-slate-100 text-slate-600'
          }`}
        >
          {location.isActive ? 'Active' : 'Inactive'}
        </span>
        <ChevronRightIcon
          className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600"
          aria-hidden
        />
      </div>
    </button>
  );
};

export default LocationRow;

