import React, { useEffect, useState } from 'react';
import { adminListSecondaryButtonClass } from './admin-list-ui';
import Modal from './Modal';

export const DELETE_ALL_FILES_CONFIRM_PHRASE = 'yes delete all files';

interface ConfirmDeleteAllFilesModalProps {
  isOpen: boolean;
  fileCount: number;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteAllFilesModal: React.FC<ConfirmDeleteAllFilesModalProps> = ({
  isOpen,
  fileCount,
  deleting,
  onClose,
  onConfirm,
}) => {
  const [confirmationText, setConfirmationText] = useState('');

  useEffect(() => {
    if (!isOpen) setConfirmationText('');
  }, [isOpen]);

  const phraseMatches =
    confirmationText.trim().toLowerCase() === DELETE_ALL_FILES_CONFIRM_PHRASE;

  return (
    <Modal
      open={isOpen}
      onClose={deleting ? () => undefined : onClose}
      title="Delete all files"
      maxWidth="sm"
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className={adminListSecondaryButtonClass}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting || !phraseMatches}
            className="inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete all files'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-[13px] text-admin-text-secondary">
          This permanently deletes{' '}
          <span className="font-semibold text-admin-text">
            {fileCount} file{fileCount === 1 ? '' : 's'}
          </span>{' '}
          from storage and the database. This can’t be undone.
        </p>
        <div className="space-y-2">
          <label htmlFor="delete-all-files-confirm" className="block text-[13px] text-admin-text-secondary">
            Type{' '}
            <span className="font-semibold text-admin-text">{DELETE_ALL_FILES_CONFIRM_PHRASE}</span>{' '}
            to confirm
          </label>
          <input
            id="delete-all-files-confirm"
            type="text"
            autoComplete="off"
            autoFocus
            value={confirmationText}
            onChange={(event) => setConfirmationText(event.target.value)}
            disabled={deleting}
            placeholder={DELETE_ALL_FILES_CONFIRM_PHRASE}
            className="w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/30 disabled:opacity-50"
          />
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteAllFilesModal;
