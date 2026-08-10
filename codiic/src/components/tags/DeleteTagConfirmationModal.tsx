import React from 'react';
import { adminListSecondaryButtonClass } from '../admin-list-ui';
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
      title="Delete tag"
      maxWidth="sm"
      actions={
        <>
          <button type="button" onClick={onCancel} className={adminListSecondaryButtonClass}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-700"
          >
            Delete
          </button>
        </>
      }
    >
      <p className="text-[13px] text-admin-text-secondary">
        Are you sure you want to delete{' '}
        <span className="font-semibold text-admin-text">{tagName}</span>? This can’t be undone.
      </p>
    </Modal>
  );
};

export default DeleteTagConfirmationModal;
