import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import LocationsTable from './LocationsTable';
import { SettingsCallout, SettingsPanel } from './settings/SettingsPageScaffold';

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
    <SettingsPanel className="ring-1 ring-slate-200/60">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
        <div className="border-l-4 border-blue-500/75 pl-3">
          <h2 className="text-base font-semibold text-gray-900">All locations</h2>
          <p className="mt-1 text-sm text-gray-500">
            Fulfillment, pickup, and local delivery use these addresses. Select a row to view or edit.
          </p>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        {error && (
          <SettingsCallout
            variant="warning"
            title="Could not load locations"
            icon={<ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />}
            className="mb-4"
          >
            {error}
          </SettingsCallout>
        )}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"
              aria-hidden
            />
            <p className="text-sm text-gray-500">Loading locations…</p>
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
    </SettingsPanel>
  );
};

export default LocationDetailsSection;

