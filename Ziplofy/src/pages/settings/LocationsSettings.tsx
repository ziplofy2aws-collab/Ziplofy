import React, { useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import DefaultLocationRow from '../../components/DefaultLocationRow';
import LocationDetailsSection from '../../components/LocationDetailsSection';
import { useLocations } from '../../contexts/location.context';
import { useStore } from '../../contexts/store.context';
import { SettingsHero, SettingsPanel } from '../../components/settings/SettingsPageScaffold';

const btnPrimarySm =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 sm:py-2';

export { LocationDetailSettings } from './LocationDetailSettings';
export { NewLocationSettings } from './NewLocationSettings';

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
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Locations"
          description="Manage where you stock inventory, fulfill orders, and offer pickup or local delivery."
          tip="The default location is used for new products and when a fulfillment location is not explicitly chosen."
          actions={
            <button type="button" className={btnPrimarySm} onClick={handleAddLocation}>
              <PlusIcon className="h-4 w-4 shrink-0" aria-hidden />
              Add location
            </button>
          }
        />

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Default location</h2>
              <p className="mt-1 text-sm text-gray-500">
                Used by Ziplofy and connected apps when no other location is specified.
              </p>
            </div>
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
              <div className="rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/40 px-4 py-10 text-center sm:px-8">
                <p className="text-sm font-semibold text-gray-900">No default location set</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                  Create a location first, then mark one as the default so new products and unnamed fulfillments use the
                  right address.
                </p>
                <button type="button" className={`${btnPrimarySm} mt-6`} onClick={handleAddLocation}>
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
