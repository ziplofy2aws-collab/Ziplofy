import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ToggleSwitch from '../../components/ToggleSwitch';
import { useLocations } from '../../contexts/location.context';
import { useStore } from '../../contexts/store.context';

export const LocationDetailSettings: React.FC = () => {
  const { locations, updateLocation } = useLocations();
  const { activeStoreId, stores } = useStore();
  const loc = useLocation();
  const navigate = useNavigate();
  const [fulfillmentEnabled, setFulfillmentEnabled] = useState<boolean>(false);
  const [canShip, setCanShip] = useState<boolean>(false);
  const [canLocalDeliver, setCanLocalDeliver] = useState<boolean>(false);
  const [canPickup, setCanPickup] = useState<boolean>(false);
  const locationId = loc.pathname.split('/').pop();
  const location = locations.find((l) => l._id === locationId);
  const isDefaultLoc = React.useMemo(() => {
    const currentStore = stores.find((s) => s._id === activeStoreId);
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
      <div className="w-full bg-white text-black">
        <div className="px-6 py-6">
          <h3 className="text-lg font-semibold text-gray-900">Location not found</h3>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back
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
    <div className="w-full bg-white text-black">
      <div className="px-6 py-6">
        <div className="bg-white p-6 mb-6 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                className="p-1 hover:bg-gray-100 rounded transition-colors mr-2"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
              </button>
              <h2 className="text-xl font-bold text-gray-900">Location</h2>
            </div>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                location.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {location.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{addressLine}</p>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Fulfillment</h3>
            <ToggleSwitch
              checked={fulfillmentEnabled}
              onChange={handleFulfillmentToggle}
              disabled={isDefaultLoc}
              label={isDefaultLoc ? 'Enable (Default location locked)' : 'Enable'}
            />
          </div>
          {isDefaultLoc && (
            <p className="text-xs text-gray-500 mt-2 block">
              This is your default location. To change whether you fulfill online orders from this
              location, select another default location first.
            </p>
          )}
          {(isDefaultLoc || fulfillmentEnabled) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <ToggleSwitch
                  checked={canShip}
                  onChange={handleCanShipChange}
                  label="Allow Shipping"
                />
              </div>
              <div>
                <ToggleSwitch
                  checked={canLocalDeliver}
                  onChange={handleCanLocalDeliverChange}
                  label="Allow Local Delivery"
                />
              </div>
              <div>
                <ToggleSwitch
                  checked={canPickup}
                  onChange={handleCanPickupChange}
                  label="Allow Pickup In-Store"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationDetailSettings;

