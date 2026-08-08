import React, { useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import DefaultLocationRow from '../../components/DefaultLocationRow';
import LocationDetailsSection from '../../components/LocationDetailsSection';
import { adminListPrimaryButtonClass } from '../../components/admin-list-ui';
import { SettingsHero, SettingsPanel } from '../../components/settings/SettingsPageScaffold';
import { useLocations } from '../../contexts/location.context';
import { useStore } from '../../contexts/store.context';

export { LocationDetailSettings } from './LocationDetailSettings';
export { NewLocationSettings } from './NewLocationSettings';

const sectionHeaderClass = 'border-b border-admin-divider bg-admin-table-header px-5 py-4 sm:px-6';

const LocationsSettings: React.FC = () => {
  const navigate = useNavigate();
  const { fetchLocationsByStoreId, locations, loading, error } = useLocations();
  const { activeStoreId, stores } = useStore();

  React.useEffect(() => {
    if (activeStoreId) fetchLocationsByStoreId(activeStoreId);
  }, [activeStoreId, fetchLocationsByStoreId]);

  const currentStore = stores.find((s) => s._id === activeStoreId);
  const defaultLocationId = currentStore?.defaultLocation || null;
  const defLoc = defaultLocationId ? locations.find((l) => l._id === defaultLocationId) : undefined;
  const addressLine = defLoc
    ? [defLoc.address, defLoc.apartment, defLoc.city, defLoc.state, defLoc.postalCode, defLoc.countryRegion]
        .filter(Boolean)
        .join(', ')
    : '';

  const handleAddLocation = useCallback(() => {
    navigate('/settings/locations/new');
  }, [navigate]);

  const handleLocationClick = useCallback(
    (locationId: string) => {
      navigate(`/settings/locations/${locationId}`);
    },
    [navigate]
  );

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
        <SettingsHero
          title="Locations"
          description="Manage where you stock inventory, fulfill orders, and offer pickup or local delivery."
          tip="The default location is used for new products and when a fulfillment location is not explicitly chosen."
          actions={
            <button type="button" className={adminListPrimaryButtonClass} onClick={handleAddLocation}>
              <PlusIcon className="h-4 w-4 shrink-0" aria-hidden />
              Add location
            </button>
          }
        />

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <h2 className="text-[13px] font-semibold text-admin-text">Default location</h2>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Used by Ziplofy and connected apps when no other location is specified.
            </p>
          </div>
          <div className="p-5 sm:p-6">
            {defaultLocationId && defLoc ? (
              <DefaultLocationRow
                name={defLoc.name}
                addressLine={addressLine}
                locations={locations}
                currentStoreId={currentStore!._id}
                defaultLocationId={defaultLocationId}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-admin-border bg-admin-secondary px-4 py-10 text-center sm:px-8">
                <p className="text-[13px] font-semibold text-admin-text">No default location set</p>
                <p className="mx-auto mt-2 max-w-md text-[13px] text-admin-text-secondary">
                  Create a location first, then mark one as the default so new products and unnamed
                  fulfillments use the right address.
                </p>
                <button
                  type="button"
                  className={`${adminListPrimaryButtonClass} mt-6`}
                  onClick={handleAddLocation}
                >
                  <PlusIcon className="h-4 w-4 shrink-0" aria-hidden />
                  Add your first location
                </button>
              </div>
            )}
          </div>
        </SettingsPanel>

        <LocationDetailsSection
          locations={locations}
          defaultLocationId={defaultLocationId}
          loading={loading}
          error={error}
          onAddLocation={handleAddLocation}
          onLocationClick={handleLocationClick}
        />
      </div>
    </div>
  );
};

export default LocationsSettings;
