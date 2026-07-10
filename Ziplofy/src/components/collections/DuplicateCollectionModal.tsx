import React from 'react';
import Modal from '../Modal';

interface DuplicateCollectionModalProps {
  isOpen: boolean;
  collectionTitle?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DuplicateCollectionModal: React.FC<DuplicateCollectionModalProps> = ({
  isOpen,
  collectionTitle,
  loading = false,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Duplicate collection"
      maxWidth="sm"
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Duplicating…' : 'Duplicate'}
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-700">
        Create a copy of{' '}
        {collectionTitle ? <span className="font-medium">{collectionTitle}</span> : 'this collection'}{' '}
        with the same products, description, and settings. The duplicate will be saved as a draft with a new URL
        handle.
      </p>
    </Modal>
  );
};

export default DuplicateCollectionModal;
