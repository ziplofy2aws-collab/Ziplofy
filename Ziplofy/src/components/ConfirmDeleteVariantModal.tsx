import React from 'react';
import Modal from './Modal';

interface ConfirmDeleteVariantModalProps {
  isOpen: boolean;
  selectedDimension: string;
  deletingVariant: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteVariantModal: React.FC<ConfirmDeleteVariantModalProps> = ({
  isOpen,
  selectedDimension,
  deletingVariant,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={<span className="text-red-600">⚠️ Confirm Deletion</span>}
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            disabled={deletingVariant}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deletingVariant}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deletingVariant ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-900">
          Are you sure you want to delete the <strong>"{selectedDimension}"</strong> dimension?
        </p>
        <p className="text-sm text-red-600">
          ⚠️ This action cannot be undone. All product variants containing this dimension will be permanently removed.
        </p>
        <p className="text-sm text-gray-600">
          If this is the only dimension, the product will revert to a single default variant.
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteVariantModal;
