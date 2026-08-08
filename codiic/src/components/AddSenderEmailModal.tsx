import React from 'react';
import {
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from './admin-list-ui';
import Modal from './Modal';

interface AddSenderEmailModalProps {
  open: boolean;
  onClose: () => void;
  emailInput: string;
  onEmailInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  saving: boolean;
}

const fieldClass =
  'w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued outline-none transition-colors focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3]/30';

const AddSenderEmailModal: React.FC<AddSenderEmailModalProps> = ({
  open,
  onClose,
  emailInput,
  onEmailInputChange,
  onSubmit,
  saving,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && emailInput.trim() && !saving) {
      onSubmit();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add sender email"
      maxWidth="sm"
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className={adminListSecondaryButtonClass}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!emailInput.trim() || saving}
            className={`${adminListPrimaryButtonClass} min-w-[100px]`}
          >
            {saving ? 'Adding...' : 'Add email'}
          </button>
        </>
      }
    >
      <p className="mb-4 text-[13px] text-admin-text-secondary">
        The email your store uses to send emails to your customers
      </p>
      <input
        type="email"
        value={emailInput}
        onChange={onEmailInputChange}
        placeholder="example@email.com"
        autoFocus
        onKeyDown={handleKeyDown}
        className={fieldClass}
      />
    </Modal>
  );
};

export default AddSenderEmailModal;
