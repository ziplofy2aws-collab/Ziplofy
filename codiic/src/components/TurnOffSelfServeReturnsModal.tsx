import React from 'react';
import Modal from './Modal';

interface TurnOffSelfServeReturnsModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const TurnOffSelfServeReturnsModal: React.FC<TurnOffSelfServeReturnsModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Turn off self-serve returns?"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-900 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Turn off self-serve returns
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-600">
        Customers will no longer be able to request returns from their accounts. You can still process any return requests that need your review.
      </p>
    </Modal>
  );
};

export default TurnOffSelfServeReturnsModal;

