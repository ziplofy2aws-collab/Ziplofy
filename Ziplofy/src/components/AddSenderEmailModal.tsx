import React from 'react';
import Modal from './Modal';

interface AddSenderEmailModalProps {
  open: boolean;
  onClose: () => void;
  emailInput: string;
  onEmailInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  saving: boolean;
}

const AddSenderEmailModal: React.FC<AddSenderEmailModalProps> = ({
  open,
  onClose,
  emailInput,
  onEmailInputChange,
  onSubmit,
  saving,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!emailInput.trim() || saving}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed min-w-[100px] transition-colors"
          >
            {saving ? 'Adding...' : 'Add email'}
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-600 mb-6">
        The email your store uses to send emails to your customers
      </p>
      <input
        type="email"
        value={emailInput}
        onChange={onEmailInputChange}
        placeholder="example@email.com"
        autoFocus
        onKeyPress={handleKeyPress}
        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      />
    </Modal>
  );
};

export default AddSenderEmailModal;

