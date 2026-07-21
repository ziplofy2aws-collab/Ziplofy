import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import React from 'react';
import Modal from './Modal';

interface VariantForm {
  optionName: string;
  values: string[];
}

interface AddProductVariantsModalProps {
  isOpen: boolean;
  variantsForm: VariantForm[];
  submittingVariants: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onAddVariantRow: () => void;
  onRemoveVariantRow: (index: number) => void;
  onUpdateVariantOptionName: (index: number, optionName: string) => void;
  onAddVariantValue: (variantIndex: number) => void;
  onRemoveVariantValue: (variantIndex: number, valueIndex: number) => void;
  onUpdateVariantValue: (variantIndex: number, valueIndex: number, value: string) => void;
}

const AddProductVariantsModal: React.FC<AddProductVariantsModalProps> = ({
  isOpen,
  variantsForm,
  submittingVariants,
  onClose,
  onSubmit,
  onAddVariantRow,
  onRemoveVariantRow,
  onUpdateVariantOptionName,
  onAddVariantValue,
  onRemoveVariantValue,
  onUpdateVariantValue,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Add Product Variants"
      maxWidth="md"
      actions={
        <>
          <button
            onClick={onClose}
            disabled={submittingVariants}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={submittingVariants}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingVariants ? 'Saving...' : 'Save'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          Add options like size or color. Each option can have multiple values.
        </p>
        <div className="flex flex-col gap-4">
          {variantsForm.map((variant, variantIndex) => (
            <div key={variantIndex} className="p-3 border border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-medium">
                  Option {variantIndex + 1}
                </p>
                <button
                  onClick={() => onRemoveVariantRow(variantIndex)}
                  className="p-1 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                className="w-full px-3 py-1.5 text-sm border border-gray-200 mb-3 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                placeholder="e.g., Size, Color, Material"
                value={variant.optionName}
                onChange={(e) => onUpdateVariantOptionName(variantIndex, e.target.value)}
              />

              <p className="text-sm font-medium mb-2">
                Option Values
              </p>
              {variant.values.map((value, valueIndex) => (
                <div key={valueIndex} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    placeholder="Enter value"
                    value={value}
                    onChange={(e) => onUpdateVariantValue(variantIndex, valueIndex, e.target.value)}
                  />
                  <button
                    onClick={() => onRemoveVariantValue(variantIndex, valueIndex)}
                    disabled={variant.values.length === 1}
                    className="p-2 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => onAddVariantValue(variantIndex)}
                className="text-sm text-gray-700 hover:text-gray-900 font-medium mt-1 flex items-center gap-1 w-fit"
              >
                <PlusIcon className="w-4 h-4" />
                Add another value
              </button>
            </div>
          ))}
          <button
            onClick={onAddVariantRow}
            className="w-full border border-gray-200 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add options like size or color
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddProductVariantsModal;
