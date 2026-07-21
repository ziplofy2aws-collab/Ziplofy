import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ToggleSwitch from '../../components/ToggleSwitch';
import { useLocations } from '../../contexts/location.context';
import { useStore } from '../../contexts/store.context';

export const NewLocationSettings: React.FC = () => {
  const navigate = useNavigate();
  const { createLocation } = useLocations();
  const { activeStoreId } = useStore();
  const [fulfillmentEnabled, setFulfillmentEnabled] = useState(false);
  const [form, setForm] = useState({
    name: '',
    countryRegion: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    canShip: false,
    canLocalDeliver: false,
    canPickup: false,
  });

  const handleChange = useCallback((k: string, v: any) => {
    setForm((p) => ({ ...p, [k]: v }));
  }, []);

  const handleAdd = useCallback(async () => {
    if (!activeStoreId) {
      navigate('/settings/locations');
      return;
    }
    await createLocation({
      storeId: activeStoreId,
      name: form.name,
      countryRegion: form.countryRegion,
      address: form.address,
      apartment: form.apartment || undefined,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      phone: form.phone,
      canShip: fulfillmentEnabled ? form.canShip : false,
      canLocalDeliver: fulfillmentEnabled ? form.canLocalDeliver : false,
      canPickup: fulfillmentEnabled ? form.canPickup : false,
      isDefault: false,
      isFulfillmentAllowed: fulfillmentEnabled,
      isActive: true,
    } as any);
    navigate('/settings/locations');
  }, [activeStoreId, form, fulfillmentEnabled, createLocation, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/settings/locations');
  }, [navigate]);

  const handleFulfillmentToggle = useCallback((checked: boolean) => {
    setFulfillmentEnabled(checked);
  }, []);

  const handleFulfillmentOptionChange = useCallback(
    (field: string, checked: boolean) => {
      handleChange(field, checked);
    },
    [handleChange]
  );

  return (
    <div className="w-full bg-white text-black">
      <div className="px-6 py-6">
        <div className="flex justify-end items-center mb-4 gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Add Location</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country / Region</label>
              <input
                type="text"
                value={form.countryRegion}
                onChange={(e) => handleChange('countryRegion', e.target.value)}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Apartment, suite, etc. (optional)
              </label>
              <input
                type="text"
                value={form.apartment}
                onChange={(e) => handleChange('apartment', e.target.value)}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">State / Province</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">PIN / Postal Code</label>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 border border-gray-200 rounded-lg mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Fulfillment</h3>
            <ToggleSwitch checked={fulfillmentEnabled} onChange={handleFulfillmentToggle} label="Enable" />
          </div>
          {fulfillmentEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <ToggleSwitch
                  checked={form.canShip}
                  onChange={(checked) => handleFulfillmentOptionChange('canShip', checked)}
                  label="Allow Shipping"
                />
              </div>
              <div>
                <ToggleSwitch
                  checked={form.canLocalDeliver}
                  onChange={(checked) => handleFulfillmentOptionChange('canLocalDeliver', checked)}
                  label="Allow Local Delivery"
                />
              </div>
              <div>
                <ToggleSwitch
                  checked={form.canPickup}
                  onChange={(checked) => handleFulfillmentOptionChange('canPickup', checked)}
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

export default NewLocationSettings;

