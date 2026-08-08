import React from 'react';
import { adminListPrimaryButtonClass, adminListSecondaryButtonClass } from './admin-list-ui';
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

const inputClass =
  'w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-1.5 text-[13px] font-normal text-admin-text focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';

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
          <button type="button" onClick={onClose} className={adminListSecondaryButtonClass}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isDisabled}
            className={`${adminListPrimaryButtonClass} disabled:bg-admin-fill disabled:text-admin-text-subdued`}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </>
      }
    >
      <p className="mb-6 text-[13px] text-admin-text-secondary">
        These details could be publicly available. Do not use your personal information.
      </p>

      <div className="mb-6">
        <label htmlFor="store-name" className="mb-1 block text-[13px] font-medium text-admin-text">
          Store name
        </label>
        <input
          id="store-name"
          type="text"
          value={storeName}
          onChange={onStoreNameChange}
          className={`${inputClass} mb-1`}
        />
        <p className="text-[12px] text-admin-text-secondary">Appears on your website</p>
      </div>

      <div className="mb-6">
        <label htmlFor="store-email" className="mb-1 block text-[13px] font-medium text-admin-text">
          Store email
        </label>
        <input
          id="store-email"
          type="email"
          value={storeEmail}
          onChange={onStoreEmailChange}
          className={`${inputClass} mb-1`}
        />
        <p className="text-[12px] text-admin-text-secondary">
          Receives messages about your store. For sender email, go to{' '}
          <a href="/settings/notifications" className="text-[#005bd3] hover:underline">
            notification settings
          </a>
          .
        </p>
      </div>

      <div>
        <label htmlFor="store-phone" className="mb-1 block text-[13px] font-medium text-admin-text">
          Store phone
        </label>
        <input
          id="store-phone"
          type="tel"
          value={storePhone}
          onChange={onStorePhoneChange}
          className={inputClass}
        />
      </div>
    </Modal>
  );
}
