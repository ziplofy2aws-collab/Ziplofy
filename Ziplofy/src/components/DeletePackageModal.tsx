import React from 'react';
import Modal from './Modal';

interface DeletePackageModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  packageName?: string;
}

const DeletePackageModal: React.FC<DeletePackageModalProps> = ({
  open,
  onClose,
  onConfirm,
  packageName,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Package"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            No, Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Yes, Delete
          </button>
        </>
      }
    >
      <div>
        <p className="text-base text-gray-900">
          Do you really want to delete this package <strong>"{packageName}"</strong>?
        </p>
        <p className="text-sm text-gray-600 mt-2">
          This action cannot be undone.
        </p>
      </div>
    </Modal>
  );
};

export default DeletePackageModal;

