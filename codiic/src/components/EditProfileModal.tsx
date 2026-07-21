import React from 'react';
import Modal from './Modal';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  storeName: string;
  storeEmail: string;
  storePhone: string;
  initialValues: {
    storeName: string;
    storeEmail: string;
    storePhone: string;
  };
  onStoreNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStoreEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStorePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function EditProfileModal({
  open,
  onClose,
  onSave,
  saving,
  storeName,
  storeEmail,
  storePhone,
  initialValues,
  onStoreNameChange,
  onStoreEmailChange,
  onStorePhoneChange,
}: EditProfileModalProps) {
  const hasChanges =
    storeName !== initialValues.storeName ||
    storeEmail !== initialValues.storeEmail ||
    storePhone !== initialValues.storePhone;

  const isDisabled = saving || !hasChanges;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit profile"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-900 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isDisabled}
            className={`px-4 py-2 text-sm font-medium text-white rounded transition-colors ${
              hasChanges
                ? 'bg-gray-900 hover:bg-gray-800'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-600 mb-6">
        These details could be publicly available. Do not use your personal information.
      </p>

      <div className="mb-6">
        <label htmlFor="store-name" className="block text-sm font-medium text-gray-700 mb-1">
          Store name
        </label>
        <input
          id="store-name"
          type="text"
          value={storeName}
          onChange={onStoreNameChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-1"
        />
        <p className="text-xs text-gray-600">Appears on your website</p>
      </div>

      <div className="mb-6">
        <label htmlFor="store-email" className="block text-sm font-medium text-gray-700 mb-1">
          Store email
        </label>
        <input
          id="store-email"
          type="email"
          value={storeEmail}
          onChange={onStoreEmailChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-1"
        />
        <p className="text-xs text-gray-600">
          Receives messages about your store. For sender email, go to{' '}
          <a href="/settings/notifications" className="text-blue-600 hover:underline">
            notification settings
          </a>
          .
        </p>
      </div>

      <div>
        <label htmlFor="store-phone" className="block text-sm font-medium text-gray-700 mb-1">
          Store phone
        </label>
        <input
          id="store-phone"
          type="tel"
          value={storePhone}
          onChange={onStorePhoneChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </Modal>
  );
}

