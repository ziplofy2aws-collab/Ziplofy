import React from 'react';
import Modal from '../Modal';

interface DeleteTagConfirmationModalProps {
  isOpen: boolean;
  tagName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteTagConfirmationModal: React.FC<DeleteTagConfirmationModalProps> = ({
  isOpen,
  tagName,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onCancel}
      title="Confirm Delete"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Yes
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-700">
        Are you sure you want to delete <span className="font-medium">{tagName}</span> tag?
      </p>
    </Modal>
  );
};

export default DeleteTagConfirmationModal;

