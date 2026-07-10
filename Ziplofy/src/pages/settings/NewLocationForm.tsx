import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import FulfillmentSection from '../../components/FulfillmentSection';
import LocationFormFields from '../../components/LocationFormFields';
import { useLocations } from '../../contexts/location.context';
import { useStore } from '../../contexts/store.context';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';

const NewLocationForm: React.FC = () => {
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
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Add location"
          description="Add a new store location with address and fulfillment options."
          leading={
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200/90 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50/90 transition-colors shrink-0"
              aria-label="Back to locations"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200/90 shadow-sm hover:bg-gray-50/90 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-blue-600 shadow-sm hover:bg-blue-700 transition-colors"
              >
                Add location
              </button>
            </div>
          }
        />

        <LocationFormFields form={form} onChange={handleChange} />
        <FulfillmentSection
          fulfillmentEnabled={fulfillmentEnabled}
          canShip={form.canShip}
          canLocalDeliver={form.canLocalDeliver}
          canPickup={form.canPickup}
          onFulfillmentToggle={handleFulfillmentToggle}
          onCanShipChange={(checked) => handleFulfillmentOptionChange('canShip', checked)}
          onCanLocalDeliverChange={(checked) => handleFulfillmentOptionChange('canLocalDeliver', checked)}
          onCanPickupChange={(checked) => handleFulfillmentOptionChange('canPickup', checked)}
        />
      </div>
    </div>
  );
};

export default NewLocationForm;
