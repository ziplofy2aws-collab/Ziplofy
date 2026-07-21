import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { Product } from '../contexts/product.context';
import Modal from './Modal';

interface AddOptionValuesModalProps {
  isOpen: boolean;
  product: Product | null;
  selectedOptionName: string;
  newOptionValues: string[];
  submittingOption: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onOptionNameChange: (optionName: string) => void;
  onUpdateNewOptionValue: (index: number, value: string) => void;
  onAddNewOptionValue: () => void;
  onRemoveNewOptionValue: (index: number) => void;
}

const AddOptionValuesModal: React.FC<AddOptionValuesModalProps> = ({
  isOpen,
  product,
  selectedOptionName,
  newOptionValues,
  submittingOption,
  onClose,
  onSubmit,
  onOptionNameChange,
  onUpdateNewOptionValue,
  onAddNewOptionValue,
  onRemoveNewOptionValue,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Add Option Values"
      maxWidth="md"
      actions={
        <>
          <button
            onClick={onClose}
            disabled={submittingOption}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!selectedOptionName || newOptionValues.every(v => !v.trim()) || submittingOption}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingOption ? 'Adding...' : 'Add Values'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          Add new values to an existing variant option. This will create new variants with the additional values.
        </p>
        
        <select
          value={selectedOptionName}
          onChange={(e) => onOptionNameChange(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
        >
          <option value="" disabled>
            Select an option to add values to
          </option>
          {product?.variants?.map((variant, index) => (
            <option key={index} value={variant.optionName}>
              {variant.optionName}
            </option>
          ))}
        </select>

        {/* Show existing values when option is selected */}
        {selectedOptionName && (
          <div className="p-3 bg-gray-50 border border-gray-200">
            <p className="text-sm font-medium mb-2">
              Current values for "{selectedOptionName}":
            </p>
            <div className="flex gap-2 flex-wrap">
              {product?.variants
                ?.find(v => v.optionName === selectedOptionName)
                ?.values?.map((value, index) => (
                  <span key={index} className="px-2 py-1 text-xs font-medium border border-gray-200 text-gray-700">
                    {value}
                  </span>
                ))}
            </div>
          </div>
        )}

        <p className="text-sm font-medium">
          New Option Values
        </p>
        {newOptionValues.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              placeholder="Enter new value"
              value={value}
              onChange={(e) => onUpdateNewOptionValue(index, e.target.value)}
            />
            <button
              onClick={() => onRemoveNewOptionValue(index)}
              disabled={newOptionValues.length === 1}
              className="p-2 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={onAddNewOptionValue}
          className="text-sm text-gray-700 hover:text-gray-900 font-medium mt-1 flex items-center gap-1 w-fit"
        >
          <PlusIcon className="w-4 h-4" />
          Add another value
        </button>
      </div>
    </Modal>
  );
};

export default AddOptionValuesModal;
