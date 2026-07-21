import React from 'react';
import ToggleSwitch from './ToggleSwitch';

interface FulfillmentOptionsProps {
  canShip: boolean;
  canLocalDeliver: boolean;
  canPickup: boolean;
  onCanShipChange: (checked: boolean) => void;
  onCanLocalDeliverChange: (checked: boolean) => void;
  onCanPickupChange: (checked: boolean) => void;
}

const FulfillmentOptions: React.FC<FulfillmentOptionsProps> = ({
  canShip,
  canLocalDeliver,
  canPickup,
  onCanShipChange,
  onCanLocalDeliverChange,
  onCanPickupChange,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <ToggleSwitch checked={canShip} onChange={onCanShipChange} label="Allow Shipping" />
      </div>
      <div>
        <ToggleSwitch
          checked={canLocalDeliver}
          onChange={onCanLocalDeliverChange}
          label="Allow Local Delivery"
        />
      </div>
      <div>
        <ToggleSwitch checked={canPickup} onChange={onCanPickupChange} label="Allow Pickup In-Store" />
      </div>
    </div>
  );
};

export default FulfillmentOptions;

