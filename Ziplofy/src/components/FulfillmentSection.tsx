import React from 'react';
import FulfillmentOptions from './FulfillmentOptions';
import ToggleSwitch from './ToggleSwitch';

interface FulfillmentSectionProps {
  fulfillmentEnabled: boolean;
  canShip: boolean;
  canLocalDeliver: boolean;
  canPickup: boolean;
  onFulfillmentToggle: (checked: boolean) => void;
  onCanShipChange: (checked: boolean) => void;
  onCanLocalDeliverChange: (checked: boolean) => void;
  onCanPickupChange: (checked: boolean) => void;
}

const FulfillmentSection: React.FC<FulfillmentSectionProps> = ({
  fulfillmentEnabled,
  canShip,
  canLocalDeliver,
  canPickup,
  onFulfillmentToggle,
  onCanShipChange,
  onCanLocalDeliverChange,
  onCanPickupChange,
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-3">
        <div>
          <h2 className="text-[13px] font-semibold text-gray-900">Fulfillment</h2>
          <p className="mt-0.5 text-[12px] font-normal text-gray-500">
            Choose how this location can fulfill orders.
          </p>
        </div>
        <ToggleSwitch checked={fulfillmentEnabled} onChange={onFulfillmentToggle} label="Enable" />
      </div>
      {fulfillmentEnabled ? (
        <div className="px-4 py-4">
          <FulfillmentOptions
            canShip={canShip}
            canLocalDeliver={canLocalDeliver}
            canPickup={canPickup}
            onCanShipChange={onCanShipChange}
            onCanLocalDeliverChange={onCanLocalDeliverChange}
            onCanPickupChange={onCanPickupChange}
          />
        </div>
      ) : null}
    </div>
  );
};

export default FulfillmentSection;
