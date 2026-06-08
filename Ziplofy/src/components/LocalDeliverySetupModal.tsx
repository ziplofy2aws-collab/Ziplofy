import React from 'react';
import Modal from './Modal';

interface LocalDeliverySetupModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  creating: boolean;
}

const LocalDeliverySetupModal: React.FC<LocalDeliverySetupModalProps> = ({
  open,
  onClose,
  onConfirm,
  creating,
}) => {
  const handleClose = () => {
    if (!creating) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Enable local delivery?"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            disabled={creating}
            className="px-4 py-2 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            disabled={creating}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Yes
          </button>
        </>
      }
    >
      <p className="text-base text-gray-900">
        Do you really want to set up local delivery for this store?
      </p>
    </Modal>
  );
};

export default LocalDeliverySetupModal;

