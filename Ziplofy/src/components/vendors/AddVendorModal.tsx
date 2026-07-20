import React from 'react';
import Modal from '../Modal';
import {
  vendorInputClass,
  vendorPrimaryButtonClass,
  vendorSecondaryButtonClass,
} from './vendor-ui.util';

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
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Add vendor"
      maxWidth="sm"
      actions={
        <>
          <button type="button" onClick={onClose} className={vendorSecondaryButtonClass}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!vendorName.trim()}
            className={vendorPrimaryButtonClass}
          >
            Add vendor
          </button>
        </>
      }
    >
      <div>
        <label htmlFor="vendor-name" className="mb-1.5 block text-[13px] font-medium text-gray-700">
          Vendor name
        </label>
        <input
          id="vendor-name"
          type="text"
          autoFocus
          value={vendorName}
          onChange={onVendorNameChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && vendorName.trim()) onSubmit();
          }}
          className={vendorInputClass}
          placeholder="e.g. Acme Wholesale Co."
        />
      </div>
    </Modal>
  );
};

export default AddVendorModal;
