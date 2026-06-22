import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FulfillmentSection from '../../components/FulfillmentSection';
import LocationFormFields from '../../components/LocationFormFields';
import LocationFormHeader from '../../components/locations/LocationFormHeader';
import { useLocations } from '../../contexts/location.context';
import { useStore } from '../../contexts/store.context';

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

  const handleChange = useCallback((k: string, v: unknown) => {
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
    } as Parameters<typeof createLocation>[0]);
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
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4">
        <LocationFormHeader
          title="Add location"
          onBack={handleCancel}
          onCancel={handleCancel}
          onSubmit={handleAdd}
          submitLabel="Add location"
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
