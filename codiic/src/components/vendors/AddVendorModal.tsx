import React from 'react';
import {
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from '../admin-list-ui';
import Modal from '../Modal';
import { vendorInputClass } from './vendor-ui.util';

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorName: string;
  onVendorNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const AddVendorModal: React.FC<AddVendorModalProps> = ({
  isOpen,
  onClose,
  vendorName,
  onVendorNameChange,
  onSubmit,
}) => {
  const canSubmit = Boolean(vendorName.trim());

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Add vendor"
      maxWidth="sm"
      actions={
        <>
          <button type="button" onClick={onClose} className={adminListSecondaryButtonClass}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className={adminListPrimaryButtonClass}
          >
            Add vendor
          </button>
        </>
      }
    >
      <p className="mb-4 text-[13px] text-admin-text-secondary">
        Vendors help you organize suppliers when editing products or purchase orders.
      </p>
      <div>
        <label htmlFor="vendor-name" className="mb-1.5 block text-[13px] font-semibold text-admin-text">
          Vendor name
        </label>
        <input
          id="vendor-name"
          type="text"
          autoFocus
          value={vendorName}
          onChange={onVendorNameChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canSubmit) onSubmit();
          }}
          className={vendorInputClass}
          placeholder="e.g. Acme Wholesale Co."
        />
      </div>
    </Modal>
  );
};

export default AddVendorModal;
