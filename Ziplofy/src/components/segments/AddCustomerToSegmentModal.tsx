import React from 'react';
import Modal from '../Modal';

interface AddCustomerToSegmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCustomerId: string;
  onCustomerChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  customers: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  canSave: boolean;
  onSave: () => void;
}

const AddCustomerToSegmentModal: React.FC<AddCustomerToSegmentModalProps> = ({
  isOpen,
  onClose,
  selectedCustomerId,
  onCustomerChange,
  customers,
  canSave,
  onSave,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Add customer to segment"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!canSave}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save
          </button>
        </>
      }
    >
      <div>
        <label htmlFor="customer-select" className="block text-sm font-medium text-gray-700 mb-1.5">
          Customer
        </label>
        <select
          id="customer-select"
          value={selectedCustomerId}
          onChange={onCustomerChange}
          className="w-full px-3 py-1.5 text-base border border-gray-200 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors bg-white"
        >
          <option value="">Select a customer</option>
          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {`${c.firstName} ${c.lastName}`} - {c.email}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  );
};

export default AddCustomerToSegmentModal;

