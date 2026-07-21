import React from 'react';
import { Product } from '../contexts/product.context';
import Modal from './Modal';

interface DeleteVariantDimensionModalProps {
  isOpen: boolean;
  product: Product | null;
  selectedDimension: string;
  onClose: () => void;
  onContinue: () => void;
  onDimensionChange: (dimension: string) => void;
}

const DeleteVariantDimensionModal: React.FC<DeleteVariantDimensionModalProps> = ({
  isOpen,
  product,
  selectedDimension,
  onClose,
  onContinue,
  onDimensionChange,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Delete Variant Dimension"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onContinue}
            disabled={!selectedDimension}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          Select the variant dimension you want to delete from this product. This action will remove all variants that contain this dimension.
        </p>
        
        <select
          value={selectedDimension}
          onChange={(e) => onDimensionChange(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
        >
          <option value="" disabled>
            Select a dimension to delete
          </option>
          {product?.variants?.map((variant, index) => (
            <option key={index} value={variant.optionName}>
              {variant.optionName}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  );
};

export default DeleteVariantDimensionModal;
