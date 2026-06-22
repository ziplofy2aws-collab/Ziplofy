import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLocationRow from '../../components/DefaultLocationRow';
import LocationDetailsSection from '../../components/LocationDetailsSection';
import LocationsPageHeader from '../../components/locations/LocationsPageHeader';
import { locationPrimaryButtonClass } from '../../components/locations/location-ui.util';
import { useLocations } from '../../contexts/location.context';
import { useStore } from '../../contexts/store.context';

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
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4">
        <LocationsPageHeader onAddLocation={handleAddLocation} />

        <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-[13px] font-semibold text-gray-900">Default location</h2>
            <p className="mt-0.5 text-[12px] font-normal text-gray-500">
              Used when no other location is specified for new products or fulfillments.
            </p>
          </div>
          <div className="px-4 py-4">
            {defaultLocationId && defLoc && currentStore ? (
              <DefaultLocationRow
                name={defLoc.name}
                addressLine={addressLine}
                locations={locations}
                currentStoreId={currentStore._id}
                defaultLocationId={defaultLocationId}
              />
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <p className="text-[15px] font-semibold text-gray-900">No default location set</p>
                <p className="mt-1.5 max-w-md text-[13px] font-normal text-gray-500">
                  Create a location first, then mark one as the default.
                </p>
                <button type="button" className={`mt-4 ${locationPrimaryButtonClass}`} onClick={handleAddLocation}>
                  Add your first location
                </button>
              </div>
            )}
          </div>
        </div>

        <LocationDetailsSection
          locations={locations}
          defaultLocationId={defaultLocationId}
          loading={loading}
          error={error}
          onAddLocation={handleAddLocation}
          onLocationClick={handleLocationClick}
        />

        <div className="pb-2 text-center">
          <p className="text-xs text-gray-500">
            <a href="#" className="text-gray-600 hover:text-gray-800">
              Learn more about locations
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationsSettings;
