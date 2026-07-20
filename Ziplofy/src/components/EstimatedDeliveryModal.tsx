import React from 'react';
import Modal from './Modal';
import Select from './Select';

interface EstimatedDeliveryModalProps {
  open: boolean;
  onClose: () => void;
  estimatedDeliveryMode: 'off' | 'manual';
  onEstimatedDeliveryModeChange: (mode: 'off' | 'manual') => void;
  estimatedFulfillmentTime: string;
  onEstimatedFulfillmentTimeChange: (value: string) => void;
  estimatedCustomTime: string;
  onEstimatedCustomTimeChange: (value: string) => void;
  estimatedCustomUnit: 'business-days' | 'weeks';
  onEstimatedCustomUnitChange: (value: 'business-days' | 'weeks') => void;
  onSave: () => void;
}

const EstimatedDeliveryModal: React.FC<EstimatedDeliveryModalProps> = ({
  open,
  onClose,
  estimatedDeliveryMode,
  onEstimatedDeliveryModeChange,
  estimatedFulfillmentTime,
  onEstimatedFulfillmentTimeChange,
  estimatedCustomTime,
  onEstimatedCustomTimeChange,
  estimatedCustomUnit,
  onEstimatedCustomUnitChange,
  onSave,
}) => {
  const fulfillmentTimeOptions = [
    { value: 'same-business-day', label: 'Same business day' },
    { value: 'next-business-day', label: 'Next business day' },
    { value: 'two-business-days', label: '2 business days' },
    { value: 'custom', label: 'Custom' },
  ];

  const customUnitOptions = [
    { value: 'business-days', label: 'business days' },
    { value: 'weeks', label: 'weeks' },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Estimated delivery dates"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-900 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Save
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-5 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked
                  readOnly
                  className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                />
                <span className="text-base font-semibold text-gray-900">Standard</span>
              </label>
              <p className="text-sm text-gray-600 ml-7 mt-1">
                Tuesday, May 27–Friday, May 30
              </p>
            </div>
            <p className="font-semibold text-gray-900">₹10.00</p>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                checked={estimatedDeliveryMode === 'off'}
                onChange={() => onEstimatedDeliveryModeChange('off')}
                className="mt-1 w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
              />
              <div>
                <p className="text-base font-semibold text-gray-900">Off</p>
                <p className="text-sm text-gray-600 mt-1">
                  Only shows transit time or custom descriptions based on your{' '}
                  <a href="#" className="text-blue-600 hover:underline">shipping rates</a>
                </p>
              </div>
            </label>
            <div className="border-t border-gray-200 my-2" />
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                checked={estimatedDeliveryMode === 'manual'}
                onChange={() => onEstimatedDeliveryModeChange('manual')}
                className="mt-1 w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
              />
              <div>
                <p className="text-base font-semibold text-gray-900">Manual</p>
                <p className="text-sm text-gray-600 mt-1">
                  Shows a delivery date range by adding your fulfillment time to the{' '}
                  <a href="#" className="text-blue-600 hover:underline">transit time</a>
                </p>
              </div>
            </label>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900 mb-2">Fulfillment time</p>
          <Select
            label=""
            value={estimatedFulfillmentTime}
            options={fulfillmentTimeOptions}
            onChange={onEstimatedFulfillmentTimeChange}
            disabled={estimatedDeliveryMode !== 'manual'}
            placeholder="Select fulfillment time"
          />
        </div>

        {estimatedDeliveryMode === 'manual' && estimatedFulfillmentTime === 'custom' && (
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-2">Custom time</p>
              <input
                type="text"
                value={estimatedCustomTime}
                onChange={(e) => onEstimatedCustomTimeChange(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-2">Unit</p>
              <Select
                label=""
                value={estimatedCustomUnit}
                options={customUnitOptions}
                onChange={(value) => onEstimatedCustomUnitChange(value as 'business-days' | 'weeks')}
                placeholder="Select unit"
              />
            </div>
          </div>
        )}
        <p className="text-xs text-gray-600 mt-2">
          Used to calculate manual dates
        </p>
      </div>
    </Modal>
  );
};

export default EstimatedDeliveryModal;

