import React from 'react';
import Modal from '../Modal';

interface DeactivateGiftCardModalProps {
  isOpen: boolean;
  isDeactivating: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeactivateGiftCardModal: React.FC<DeactivateGiftCardModalProps> = ({
  isOpen,
  isDeactivating,
  onCancel,
  onConfirm
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onCancel}
      title="Deactivate Gift Card"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onCancel}
            disabled={isDeactivating}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeactivating}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeactivating ? 'Deactivating...' : 'Yes, Deactivate'}
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-700">
        Are you sure you want to deactivate this gift card? This action will make the gift card
        inactive and prevent further operations on it.
      </p>
    </Modal>
  );
};

export default DeactivateGiftCardModal;

