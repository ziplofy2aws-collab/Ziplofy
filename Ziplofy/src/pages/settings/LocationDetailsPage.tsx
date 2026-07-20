import React, { useCallback } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import ToggleSwitch from '../../components/ToggleSwitch';
import { useLocations } from '../../contexts/location.context';
import { useStore } from '../../contexts/store.context';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';

const LocationDetailsPage: React.FC = () => {
  const { locations, updateLocation } = useLocations();
  const { activeStoreId, stores } = useStore();
  const loc = useLocation();
  const navigate = useNavigate();
  const [fulfillmentEnabled, setFulfillmentEnabled] = React.useState<boolean>(false);
  const [canShip, setCanShip] = React.useState<boolean>(false);
  const [canLocalDeliver, setCanLocalDeliver] = React.useState<boolean>(false);
  const [canPickup, setCanPickup] = React.useState<boolean>(false);
  const locationId = loc.pathname.split('/').pop();
  const location = locations.find(l => l._id === locationId);
  const isDefaultLoc = React.useMemo(() => {
    const currentStore = stores.find(s => s._id === activeStoreId);
    return currentStore?.defaultLocation === location?._id;
  }, [stores, activeStoreId, location]);

  React.useEffect(() => {
    if (location) {
      setFulfillmentEnabled(isDefaultLoc ? true : location.isFulfillmentAllowed);
      setCanShip(location.canShip);
      setCanLocalDeliver(location.canLocalDeliver);
      setCanPickup(location.canPickup);
    }
  }, [location, isDefaultLoc]);

  const handleBack = useCallback(() => {
    navigate('/settings/locations');
  }, [navigate]);

  const handleFulfillmentToggle = useCallback(
    async (checked: boolean) => {
      const value = checked;
      setFulfillmentEnabled(value);
      try {
        if (!location) return;
        if (!value) {
          setCanShip(false);
          setCanLocalDeliver(false);
          setCanPickup(false);
          await updateLocation(location._id, {
            isFulfillmentAllowed: false,
            canShip: false,
            canLocalDeliver: false,
            canPickup: false,
          });
        } else {
          await updateLocation(location._id, { isFulfillmentAllowed: true });
        }
      } catch {
        setFulfillmentEnabled((prev) => !prev);
      }
    },
    [location, updateLocation]
  );

  const handleCanShipChange = useCallback(
    async (checked: boolean) => {
      const v = checked;
      setCanShip(v);
      try {
        await updateLocation(location!._id, { canShip: v });
      } catch {
        setCanShip((prev) => !prev);
      }
    },
    [location, updateLocation]
  );

  const handleCanLocalDeliverChange = useCallback(
    async (checked: boolean) => {
      const v = checked;
      setCanLocalDeliver(v);
      try {
        await updateLocation(location!._id, { canLocalDeliver: v });
      } catch {
        setCanLocalDeliver((prev) => !prev);
      }
    },
    [location, updateLocation]
  );

  const handleCanPickupChange = useCallback(
    async (checked: boolean) => {
      const v = checked;
      setCanPickup(v);
      try {
        await updateLocation(location!._id, { canPickup: v });
      } catch {
        setCanPickup((prev) => !prev);
      }
    },
    [location, updateLocation]
  );

  if (!location) {
    return (
      <div className="w-full">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-gray-900">Location not found</h2>
          <button
            type="button"
            onClick={handleBack}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors w-fit"
          >
            Back to locations
          </button>
        </div>
      </div>
    );
  }

  const addressLine = [
    location.address,
    location.apartment,
    location.city,
    location.state,
    location.postalCode,
    location.countryRegion,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title={
            <span className="inline-flex flex-wrap items-center gap-2">
              <span>{location.name}</span>
              <span
                className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${
                  location.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {location.isActive ? 'Active' : 'Inactive'}
              </span>
            </span>
          }
          description={addressLine || 'No address'}
          leading={
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200/90 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50/90 transition-colors shrink-0"
              aria-label="Back to locations"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
        />

        {/* Location Info Section */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900">Location details</h2>
          <p className="mt-1 text-sm text-gray-500 mb-4">
            Address and contact for this location.
          </p>
          <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
            <p className="text-sm font-medium text-gray-900">{location.name}</p>
            <p className="text-sm text-gray-500 mt-1">{addressLine || '—'}</p>
            {location.phone && (
              <p className="text-sm text-gray-500 mt-1">Phone: {location.phone}</p>
            )}
          </div>
        </div>

        {/* Fulfillment Section */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Fulfillment</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose how this location can fulfill orders.
              </p>
            </div>
            <ToggleSwitch
              checked={fulfillmentEnabled}
              onChange={handleFulfillmentToggle}
              disabled={isDefaultLoc}
              label={isDefaultLoc ? 'Enable (default location)' : 'Enable'}
            />
          </div>
          {isDefaultLoc && (
            <p className="mt-3 text-sm text-gray-500 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              This is your default location. To change fulfillment from this location, set another
              location as default first.
            </p>
          )}
          {(isDefaultLoc || fulfillmentEnabled) && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3">
                <ToggleSwitch
                  checked={canShip}
                  onChange={handleCanShipChange}
                  label="Allow shipping"
                />
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3">
                <ToggleSwitch
                  checked={canLocalDeliver}
                  onChange={handleCanLocalDeliverChange}
                  label="Allow local delivery"
                />
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3">
                <ToggleSwitch
                  checked={canPickup}
                  onChange={handleCanPickupChange}
                  label="Allow pickup in-store"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationDetailsPage;


