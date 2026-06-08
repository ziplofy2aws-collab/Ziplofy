import React from 'react';
import Modal from './Modal';
import Select from './Select';
import { Packaging } from '../contexts/packaging.context';

interface RateCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  rateShippingFrom: string;
  onRateShippingFromChange: (value: string) => void;
  rateShippingSearch: string;
  onRateShippingSearchChange: (value: string) => void;
  ratePackageId: string | null;
  onRatePackageIdChange: (value: string) => void;
  rateWeight: string;
  onRateWeightChange: (value: string) => void;
  rateWeightUnit: 'lb' | 'kg';
  onRateWeightUnitChange: (value: 'lb' | 'kg') => void;
  packagings: Packaging[];
}

const RateCalculatorModal: React.FC<RateCalculatorModalProps> = ({
  open,
  onClose,
  rateShippingFrom,
  onRateShippingFromChange,
  rateShippingSearch,
  onRateShippingSearchChange,
  ratePackageId,
  onRatePackageIdChange,
  rateWeight,
  onRateWeightChange,
  rateWeightUnit,
  onRateWeightUnitChange,
  packagings,
}) => {
  const rateShippingFromOptions = [
    { value: 'shop-location', label: 'Shop location' },
    { value: 'custom-origin', label: 'Custom origin' },
  ];

  const rateWeightUnitOptions = [
    { value: 'lb', label: 'lb' },
    { value: 'kg', label: 'kg' },
  ];

  const packageOptions =
    packagings.length === 0
      ? [{ value: '', label: 'No packages available' }]
      : packagings.map((pkg) => ({
          value: pkg._id,
          label: `${pkg.packageName} • ${pkg.length} × ${pkg.width} × ${pkg.height} ${pkg.dimensionsUnit}, ${pkg.weight} ${pkg.weightUnit}`,
        }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Shipping rate calculator"
      maxWidth="md"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-900 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled
            className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
          >
            Calculate discounted rates
          </button>
        </>
      }
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Shipping from</p>
            <Select
              label=""
              value={rateShippingFrom}
              options={rateShippingFromOptions}
              onChange={onRateShippingFromChange}
              placeholder="Select origin"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Shipping to</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🇮🇳</span>
              <input
                type="text"
                value={rateShippingSearch}
                onChange={(e) => onRateShippingSearchChange(e.target.value)}
                placeholder="Search destination"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Package</p>
            <Select
              label=""
              value={ratePackageId || ''}
              options={packageOptions}
              onChange={onRatePackageIdChange}
              placeholder="Select package"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Total weight</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={rateWeight}
                onChange={(e) => onRateWeightChange(e.target.value.replace(/[^0-9.]/g, ''))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
              <Select
                label=""
                value={rateWeightUnit}
                options={rateWeightUnitOptions}
                onChange={(value) => onRateWeightUnitChange(value as 'lb' | 'kg')}
                placeholder="Unit"
              />
            </div>
          </div>
        </div>
        <div className="flex-1 md:flex-[0.8] md:border-l md:border-gray-100 md:pl-6 flex items-center justify-center text-center text-gray-600">
          Calculate how much you'll save when you buy labels at discounted rates from Ziplofy
        </div>
      </div>
    </Modal>
  );
};

export default RateCalculatorModal;

