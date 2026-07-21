import React from 'react';
import { COUNTRIES } from '../../constants/countries';
import Modal from '../Modal';

interface AddressFormData {
  addressType: string;
  country: string;
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  pinCode: string;
  phoneNumber: string;
}

interface UpdateCustomerAddressModalProps {
  isOpen: boolean;
  addressForm: AddressFormData;
  onAddressChange: (key: keyof AddressFormData, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const UpdateCustomerAddressModal: React.FC<UpdateCustomerAddressModalProps> = ({
  isOpen,
  addressForm,
  onAddressChange,
  onClose,
  onSubmit,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Update Customer Address"
      maxWidth="lg"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            Update Address
          </button>
        </>
      }
    >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Address Type (home / office / other)
              </label>
              <input
                type="text"
                value={addressForm.addressType}
                onChange={(e) => onAddressChange('addressType', e.target.value)}
                className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                <select
                  value={addressForm.country}
                  onChange={(e) => onAddressChange('country', e.target.value)}
                  className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                >
                  <option value="">Select Country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
                <input
                  type="text"
                  value={addressForm.company}
                  onChange={(e) => onAddressChange('company', e.target.value)}
                  className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={addressForm.firstName}
                  onChange={(e) => onAddressChange('firstName', e.target.value)}
                  className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={addressForm.lastName}
                  onChange={(e) => onAddressChange('lastName', e.target.value)}
                  className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <input
                type="text"
                value={addressForm.address}
                onChange={(e) => onAddressChange('address', e.target.value)}
                className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Apartment, Suite, etc.
                </label>
                <input
                  type="text"
                  value={addressForm.apartment}
                  onChange={(e) => onAddressChange('apartment', e.target.value)}
                  className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input
                  type="text"
                  value={addressForm.city}
                  onChange={(e) => onAddressChange('city', e.target.value)}
                  className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                <input
                  type="text"
                  value={addressForm.state}
                  onChange={(e) => onAddressChange('state', e.target.value)}
                  className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pin Code</label>
                <input
                  type="text"
                  value={addressForm.pinCode}
                  onChange={(e) => onAddressChange('pinCode', e.target.value)}
                  className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="text"
                value={addressForm.phoneNumber}
                onChange={(e) => onAddressChange('phoneNumber', e.target.value)}
                className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
              />
            </div>
          </div>
    </Modal>
  );
};

export default UpdateCustomerAddressModal;

