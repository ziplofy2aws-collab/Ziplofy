import React, { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import type { Customer, CreateCustomerRequest } from '../../contexts/customer.context';
import { useCustomers } from '../../contexts/customer.context';
import { useStore } from '../../contexts/store.context';
import Modal from '../Modal';

type CreateGiftCardCustomerModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (customer: Customer) => void;
};

export function CreateGiftCardCustomerModal({
  open,
  onClose,
  onCreated,
}: CreateGiftCardCustomerModalProps) {
  const { activeStoreId } = useStore();
  const { addCustomer, loading } = useCustomers();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const reset = useCallback(() => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhoneNumber('');
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const canSave =
    firstName.trim().length > 0 && email.trim().length > 0 && Boolean(activeStoreId) && !loading;

  const handleSave = useCallback(async () => {
    if (!activeStoreId || !canSave) return;

    try {
      const payload: CreateCustomerRequest = {
        storeId: activeStoreId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        language: 'en',
        collectTax: 'collect',
      };
      const created = await addCustomer(payload);
      toast.success('Customer created');
      onCreated(created);
      handleClose();
    } catch {
      toast.error('Failed to create customer');
    }
  }, [
    activeStoreId,
    addCustomer,
    canSave,
    email,
    firstName,
    handleClose,
    lastName,
    onCreated,
    phoneNumber,
  ]);

  const inputClass =
    'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20';

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create a new customer"
      maxWidth="md"
      actions={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!canSave}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="gift-card-customer-first-name" className="mb-2 block text-sm font-medium text-gray-700">
            First name
          </label>
          <input
            id="gift-card-customer-first-name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="gift-card-customer-last-name" className="mb-2 block text-sm font-medium text-gray-700">
            Last name
          </label>
          <input
            id="gift-card-customer-last-name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="gift-card-customer-email" className="mb-2 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="gift-card-customer-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="gift-card-customer-phone" className="mb-2 block text-sm font-medium text-gray-700">
            Phone number
          </label>
          <input
            id="gift-card-customer-phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+91"
            className={inputClass}
          />
        </div>
      </div>
    </Modal>
  );
}
