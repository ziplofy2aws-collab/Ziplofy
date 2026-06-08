import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import LocationRow from './LocationRow';

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30';

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
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
          <PlusIcon className="h-7 w-7 text-blue-600" strokeWidth={1.5} aria-hidden />
        </div>
        <p className="mt-5 text-base font-semibold text-gray-900">No locations yet</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
          Add warehouses, retail stores, or fulfillment points. Inventory and shipping can be scoped to each address.
        </p>
        {onAddLocation ? (
          <button type="button" className={`${btnPrimary} mt-6`} onClick={onAddLocation}>
            <PlusIcon className="h-4 w-4 shrink-0" aria-hidden />
            Add location
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <>
      {locations.map((loc) => {
        return (
          <LocationRow
            key={loc._id}
            location={loc}
            isDefault={defaultLocationId === loc._id}
            onLocationClick={onLocationClick}
          />
        );
      })}
    </>
  );
};

export default LocationsList;

