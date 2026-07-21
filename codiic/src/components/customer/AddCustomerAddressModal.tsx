import React, { useCallback, useEffect, useState } from 'react';
import { COUNTRIES } from '../../constants/countries';
import type { CreateCustomerAddressRequest } from '../../contexts/customer-address.context';
import Modal from '../Modal';

interface AddCustomerAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerAddressRequest) => Promise<void>;
  customerId: string;
}

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

const AddCustomerAddressModal: React.FC<AddCustomerAddressModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customerId,
}) => {
  const [formData, setFormData] = useState<AddressFormData>({
    addressType: 'home',
    country: '',
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pinCode: '',
    phoneNumber: '',
  });

  const handleFieldChange = useCallback((field: keyof AddressFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!customerId) return;

    const addressData: CreateCustomerAddressRequest = {
      customerId,
      addressType: formData.addressType,
      country: formData.country,
      firstName: formData.firstName,
      lastName: formData.lastName,
      company: formData.company || undefined,
      address: formData.address,
      apartment: formData.apartment || undefined,
      city: formData.city,
      state: formData.state,
      pinCode: formData.pinCode,
      phoneNumber: formData.phoneNumber,
    };

    await onSubmit(addressData);
    
    // Reset form after successful submission
    setFormData({
      addressType: 'home',
      country: '',
      firstName: '',
      lastName: '',
      company: '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      pinCode: '',
      phoneNumber: '',
    });
  }, [customerId, formData, onSubmit]);

  const handleClose = useCallback(() => {
    // Reset form when closing
    setFormData({
      addressType: 'home',
      country: '',
      firstName: '',
      lastName: '',
      company: '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      pinCode: '',
      phoneNumber: '',
    });
    onClose();
  }, [onClose]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        addressType: 'home',
        country: '',
        firstName: '',
        lastName: '',
        company: '',
        address: '',
        apartment: '',
        city: '',
        state: '',
        pinCode: '',
        phoneNumber: '',
      });
    }
  }, [isOpen]);

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="Add Customer Address"
      maxWidth="lg"
      actions={
        <>
          <button
            onClick={handleClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            Save Address
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
                value={formData.addressType}
                onChange={(e) => handleFieldChange('addressType', e.target.value)}
                className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleFieldChange('country', e.target.value)}
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleFieldChange('company', e.target.value)}
                  className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
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
                  value={formData.apartment}
                  onChange={(e) => handleFieldChange('apartment', e.target.value)}
                  className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleFieldChange('state', e.target.value)}
                  className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Pin Code
                </label>
                <input
                  type="text"
                  value={formData.pinCode}
                  onChange={(e) => handleFieldChange('pinCode', e.target.value)}
                  className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                className="w-full px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
              />
            </div>
          </div>
    </Modal>
  );
};

export default AddCustomerAddressModal;

