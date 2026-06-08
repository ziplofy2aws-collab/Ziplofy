import React from 'react';
import Modal from '../Modal';

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
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!vendorName.trim()}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add vendor
          </button>
        </>
      }
    >
      <div>
        <label htmlFor="vendor-name" className="mb-2 block text-sm font-medium text-gray-700">
          Vendor name
        </label>
        <input
          id="vendor-name"
          type="text"
          autoFocus
          value={vendorName}
          onChange={onVendorNameChange}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
          placeholder="e.g. Acme Wholesale Co."
        />
      </div>
    </Modal>
  );
};

export default AddVendorModal;
