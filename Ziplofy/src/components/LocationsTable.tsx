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
    <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-inner ring-1 ring-slate-100/80">
      <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-slate-200 bg-gradient-to-r from-slate-50/95 to-slate-50/40 px-4 py-3 sm:px-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Location</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Status</p>
      </div>
      <div className="divide-y divide-slate-100">
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

