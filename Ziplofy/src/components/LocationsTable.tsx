import React from 'react';
import LocationsList from './LocationsList';
import { locationTableHeadClass, locationTableHeadRightClass } from './locations/location-ui.util';

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

interface LocationsTableProps {
  locations: Location[];
  defaultLocationId: string | null;
  onLocationClick: (locationId: string) => void;
  onAddLocation?: () => void;
}

const LocationsTable: React.FC<LocationsTableProps> = ({
  locations,
  defaultLocationId,
  onLocationClick,
  onAddLocation,
}) => {
  if (locations.length === 0) {
    return (
      <LocationsList
        locations={locations}
        defaultLocationId={defaultLocationId}
        onLocationClick={onLocationClick}
        onAddLocation={onAddLocation}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className={locationTableHeadClass}>Location</th>
            <th className={locationTableHeadRightClass}>Status</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          <LocationsList
            locations={locations}
            defaultLocationId={defaultLocationId}
            onLocationClick={onLocationClick}
            onAddLocation={onAddLocation}
          />
        </tbody>
      </table>
    </div>
  );
};

export default LocationsTable;
