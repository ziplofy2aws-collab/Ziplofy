import React from 'react';
import LocationRow from './LocationRow';
import { locationPrimaryButtonClass } from './locations/location-ui.util';

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
      <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-[15px] font-semibold text-gray-900">No locations yet</p>
        <p className="mt-1.5 max-w-md text-[13px] font-normal text-gray-500">
          Add warehouses, retail stores, or fulfillment points for inventory and shipping.
        </p>
        {onAddLocation ? (
          <button type="button" className={`mt-4 ${locationPrimaryButtonClass}`} onClick={onAddLocation}>
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
