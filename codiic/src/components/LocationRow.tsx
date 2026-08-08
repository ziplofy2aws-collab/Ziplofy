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
      className="group flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-admin-row-hover sm:px-5"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-admin-border bg-admin-secondary text-admin-text-secondary transition-colors group-hover:bg-admin-fill">
          <BuildingStorefrontIcon className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[13px] font-semibold text-admin-text">{location.name}</p>
            {isDefault ? (
              <span className="inline-flex items-center rounded-md border border-admin-border bg-admin-secondary px-2 py-0.5 text-[12px] font-medium text-admin-text">
                Default
              </span>
            ) : null}
          </div>
          {addressLine ? (
            <p className="mt-0.5 truncate text-[13px] text-admin-text-secondary sm:whitespace-normal">
              {addressLine}
            </p>
          ) : (
            <p className="mt-0.5 text-[13px] italic text-admin-text-subdued">No address on file</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`rounded-md px-2.5 py-1 text-[12px] font-medium ${
            location.isActive
              ? 'border border-admin-border bg-admin-secondary text-admin-text'
              : 'border border-admin-border bg-admin-fill text-admin-text-secondary'
          }`}
        >
          {location.isActive ? 'Active' : 'Inactive'}
        </span>
        <ChevronRightIcon
          className="h-5 w-5 text-admin-text-subdued transition-transform group-hover:translate-x-0.5 group-hover:text-admin-text"
          aria-hidden
        />
      </div>
    </button>
  );
};

export default LocationRow;
