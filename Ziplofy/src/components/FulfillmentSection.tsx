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
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Fulfillment</h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose how this location can fulfill orders.
          </p>
        </div>
        <ToggleSwitch checked={fulfillmentEnabled} onChange={onFulfillmentToggle} label="Enable" />
      </div>
      {fulfillmentEnabled && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <FulfillmentOptions
            canShip={canShip}
            canLocalDeliver={canLocalDeliver}
            canPickup={canPickup}
            onCanShipChange={onCanShipChange}
            onCanLocalDeliverChange={onCanLocalDeliverChange}
            onCanPickupChange={onCanPickupChange}
          />
        </div>
      )}
    </div>
  );
};

export default FulfillmentSection;

