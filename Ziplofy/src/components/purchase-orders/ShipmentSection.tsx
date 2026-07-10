import { TruckIcon } from '@heroicons/react/24/outline';
import React from 'react';
import Select from '../Select';

interface SelectOption {
  value: string;
  label: string;
}

interface ShipmentSectionProps {
  eta: string;
  onEtaChange: (value: string) => void;
  carrier: string;
  onCarrierChange: (value: string) => void;
  tracking: string;
  onTrackingChange: (value: string) => void;
  carrierOptions: SelectOption[];
}

const ShipmentSection: React.FC<ShipmentSectionProps> = ({
  eta,
  onEtaChange,
  carrier,
  onCarrierChange,
  tracking,
  onTrackingChange,
  carrierOptions,
}) => {
  return (
    <div className="border border-gray-200 p-4 bg-white/95">
      <h2 className="text-base font-medium text-gray-900 mb-3">Shipment</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1.5">
            Estimated arrival
          </label>
          <input
            type="date"
            value={eta}
            onChange={(e) => onEtaChange(e.target.value)}








































            
            className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>
        <Select
          label="Shipping carrier"
          value={carrier}
          options={carrierOptions}
          onChange={onCarrierChange}
          placeholder="Select carrier"
        />
        <div>
          <label className="block text-xs text-gray-600 mb-1.5">
            Tracking number
          </label>
          <input
            type="text"
            placeholder="Enter tracking"
            value={tracking}
            onChange={(e) => onTrackingChange(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>
      </div>
    </div>
  );
};

export default ShipmentSection;

