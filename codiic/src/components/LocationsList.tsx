import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { adminListPrimaryButtonClass } from './admin-list-ui';
import LocationRow from './LocationRow';

interface Location {
  _id: string;
  name: string;
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryRegion?: string;
  isActive: boolean;
}

interface LocationsListProps {
  locations: Location[];
  defaultLocationId: string | null;
  onLocationClick: (locationId: string) => void;
  onAddLocation?: () => void;
}

const LocationsList: React.FC<LocationsListProps> = ({
  locations,
  defaultLocationId,
  onLocationClick,
  onAddLocation,
}) => {
  if (locations.length === 0) {
    return (
      <div className="px-4 py-14 text-center sm:px-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-admin-border bg-admin-secondary">
          <PlusIcon className="h-7 w-7 text-admin-text" strokeWidth={1.5} aria-hidden />
        </div>
        <p className="mt-5 text-[15px] font-semibold text-admin-text">No locations yet</p>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-admin-text-secondary">
          Add warehouses, retail stores, or fulfillment points. Inventory and shipping can be scoped
          to each address.
        </p>
        {onAddLocation ? (
          <button type="button" className={`${adminListPrimaryButtonClass} mt-6`} onClick={onAddLocation}>
            <PlusIcon className="h-4 w-4 shrink-0" aria-hidden />
            Add location
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <>
      {locations.map((loc) => (
        <LocationRow
          key={loc._id}
          location={loc}
          isDefault={defaultLocationId === loc._id}
          onLocationClick={onLocationClick}
        />
      ))}
    </>
  );
};

export default LocationsList;
