import React from 'react';
import LocationsList from './LocationsList';

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
  return (
    <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
      <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-admin-border bg-admin-table-header px-4 py-3 sm:px-5">
        <p className="text-[12px] font-medium text-admin-text-secondary">Location</p>
        <p className="text-[12px] font-medium text-admin-text-secondary">Status</p>
      </div>
      <div className="divide-y divide-admin-divider">
        <LocationsList
          locations={locations}
          defaultLocationId={defaultLocationId}
          onLocationClick={onLocationClick}
          onAddLocation={onAddLocation}
        />
      </div>
    </div>
  );
};

export default LocationsTable;
