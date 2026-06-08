import React from 'react';
import Modal from '../Modal';

interface DeleteTimelineConfirmModalProps {
  isOpen: boolean;
  timelineLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteTimelineConfirmModal: React.FC<DeleteTimelineConfirmModalProps> = ({
  isOpen,
  timelineLoading,
  onCancel,
  onConfirm
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onCancel}
      title="Delete Timeline Entry"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            disabled={timelineLoading}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Yes, Delete
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-700">
        Do you really want to delete this timeline comment? This action cannot be undone.
      </p>
    </Modal>
  );
};

export default DeleteTimelineConfirmModal;

