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

const sectionHeaderClass = 'border-b border-admin-divider bg-admin-table-header px-5 py-4 sm:px-6';

const LocationDetailsSection: React.FC<LocationDetailsSectionProps> = ({
  locations,
  defaultLocationId,
  loading,
  error,
  onAddLocation,
  onLocationClick,
}) => {
  return (
    <SettingsPanel>
      <div className={sectionHeaderClass}>
        <h2 className="text-[13px] font-semibold text-admin-text">All locations</h2>
        <p className="mt-1 text-[13px] text-admin-text-secondary">
          Fulfillment, pickup, and local delivery use these addresses. Select a row to view or edit.
        </p>
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
              className="h-8 w-8 animate-spin rounded-full border-2 border-admin-border border-t-admin-text"
              aria-hidden
            />
            <p className="text-[13px] text-admin-text-secondary">Loading locations…</p>
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
