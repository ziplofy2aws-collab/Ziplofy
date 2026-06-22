import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import LocationsTable from './LocationsTable';

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

interface LocationDetailsSectionProps {
  locations: Location[];
  defaultLocationId: string | null;
  loading: boolean;
  error: string | null;
  onAddLocation: () => void;
  onLocationClick: (locationId: string) => void;
}

const LocationDetailsSection: React.FC<LocationDetailsSectionProps> = ({
  locations,
  defaultLocationId,
  loading,
  error,
  onAddLocation,
  onLocationClick,
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-[13px] font-semibold text-gray-900">All locations</h2>
        <p className="mt-0.5 text-[12px] font-normal text-gray-500">
          Select a location to view or edit details.
        </p>
      </div>

      {error ? (
        <div className="mx-4 mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
          <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
          <p className="text-[13px] text-amber-900">{error}</p>
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-700" />
        </div>
      ) : (
        <LocationsTable
          locations={locations}
          defaultLocationId={defaultLocationId}
          onLocationClick={onLocationClick}
          onAddLocation={onAddLocation}
        />
      )}
    </div>
  );
};

export default LocationDetailsSection;
