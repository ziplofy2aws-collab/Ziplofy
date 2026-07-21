import React from 'react';
import Modal from '../Modal';

interface DeleteTimelineConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteTimelineConfirmModal: React.FC<DeleteTimelineConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Delete Timeline Item"
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
      <p className="text-sm text-gray-700">Do you really want to delete this timeline item?</p>
    </Modal>
  );
};

export default DeleteTimelineConfirmModal;

