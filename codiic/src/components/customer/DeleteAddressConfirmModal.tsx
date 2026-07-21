import React from 'react';
import Modal from '../Modal';

interface DeleteAddressConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteAddressConfirmModal: React.FC<DeleteAddressConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Delete Address"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            Yes
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-700">Do you really want to delete this address?</p>
    </Modal>
  );
};

export default DeleteAddressConfirmModal;

