import React from 'react';
import Modal from '../Modal';

interface DeleteCollectionModalProps {
  isOpen: boolean;
  collectionTitle?: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteCollectionModal: React.FC<DeleteCollectionModalProps> = ({
  isOpen,
  collectionTitle,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Delete collection"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
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
        Do you really want to delete{' '}
        {collectionTitle ? `'${collectionTitle}'` : 'this collection'}?
      </p>
    </Modal>
  );
};

export default DeleteCollectionModal;

