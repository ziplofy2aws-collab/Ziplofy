import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';
import Select from './Select';
import ToggleSwitch from './ToggleSwitch';

interface PackageFormData {
  packageName: string;
  packageType: string;
  length: string;
  width: string;
  height: string;
  dimensionsUnit: string;
  weight: string;
  weightUnit: string;
  isDefault: boolean;
}

interface AddPackageModalProps {
  open: boolean;
  onClose: () => void;
  formData: {
    packageName: string;
    packageType: string;
    length: string;
    width: string;
    height: string;
    dimensionsUnit: string;
    weight: string;
    weightUnit: string;
    isDefault: boolean;
  };
  onFormChange: (field: string, value: any) => void;
  onSubmit: () => void;
}

const AddPackageModal: React.FC<AddPackageModalProps> = ({
  open,
  onClose,
  formData,
  onFormChange,
  onSubmit,
}) => {
  const packageTypeOptions = [
    { value: 'box', label: 'Box' },
    { value: 'envelope', label: 'Envelope' },
    { value: 'soft_package', label: 'Soft Package' },
  ];

  const dimensionsUnitOptions = [
    { value: 'cm', label: 'Centimeters (cm)' },
    { value: 'in', label: 'Inches (in)' },
  ];

  const weightUnitOptions = [
    { value: 'g', label: 'Grams (g)' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'oz', label: 'Ounces (oz)' },
    { value: 'lb', label: 'Pounds (lb)' },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex justify-between items-center w-full">
          <h3 className="text-lg font-semibold">Add New Package</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      }
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Add Package
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
          <input
            type="text"
            value={formData.packageName}
            onChange={(e) => onFormChange('packageName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
            required
          />
        </div>

        <div>
          <Select
            label="Package Type"
            value={formData.packageType}
            options={packageTypeOptions}
            onChange={(value) => onFormChange('packageType', value)}
            placeholder="Select package type"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900 mb-4">Dimensions</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
              <input
                type="number"
                value={formData.length}
                onChange={(e) => onFormChange('length', e.target.value)}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
              <input
                type="number"
                value={formData.width}
                onChange={(e) => onFormChange('width', e.target.value)}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                required
              />
            </div>
            {formData.packageType !== 'envelope' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => onFormChange('height', e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  required
                />
              </div>
            )}
          </div>
          <div className="mt-4">
            <Select
              label="Unit"
              value={formData.dimensionsUnit}
              options={dimensionsUnitOptions}
              onChange={(value) => onFormChange('dimensionsUnit', value)}
              placeholder="Select unit"
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900 mb-4">Weight</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => onFormChange('weight', e.target.value)}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                required
              />
            </div>
            <div>
              <Select
                label="Unit"
                value={formData.weightUnit}
                options={weightUnitOptions}
                onChange={(value) => onFormChange('weightUnit', value)}
                placeholder="Select unit"
              />
            </div>
          </div>
        </div>

        <div>
          <ToggleSwitch
            checked={formData.isDefault}
            onChange={(checked) => onFormChange('isDefault', checked)}
            label="Set as default package"
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddPackageModal;

