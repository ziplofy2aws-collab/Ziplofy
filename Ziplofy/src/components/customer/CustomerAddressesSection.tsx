import React, { useCallback, useEffect, useState } from 'react';
import type { CustomerAddress } from '../../contexts/customer-address.context';
import { useCustomerAddresses } from '../../contexts/customer-address.context';
import CustomerAddressList from './CustomerAddressList';
import DeleteAddressConfirmModal from './DeleteAddressConfirmModal';
import UpdateCustomerAddressModal from './UpdateCustomerAddressModal';

interface CustomerAddressesSectionProps {
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

const CustomerAddressesSection: React.FC<CustomerAddressesSectionProps> = ({ customerId }) => {
  const {
    addresses,
    loading: addrLoading,
    error: addrError,
    fetchCustomerAddressesByCustomerId,
    updateCustomerAddress,
    deleteCustomerAddress,
  } = useCustomerAddresses();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [addressIdToDelete, setAddressIdToDelete] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateAddressId, setUpdateAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormData>({
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

  // Fetch addresses when component mounts or customerId changes
  useEffect(() => {
    if (customerId) {
      fetchCustomerAddressesByCustomerId(customerId);
    }
  }, [customerId, fetchCustomerAddressesByCustomerId]);

  const handleAddressChange = useCallback((key: keyof AddressFormData, value: string) => {
    setAddressForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleUpdateAddress = useCallback(async () => {
    if (!updateAddressId || !customerId) return;
    await updateCustomerAddress(updateAddressId, {
      addressType: addressForm.addressType,
      country: addressForm.country,
      firstName: addressForm.firstName,
      lastName: addressForm.lastName,
      company: addressForm.company || undefined,
      address: addressForm.address,
      apartment: addressForm.apartment || undefined,
      city: addressForm.city,
      state: addressForm.state,
      pinCode: addressForm.pinCode,
      phoneNumber: addressForm.phoneNumber,
    });
    setIsUpdateModalOpen(false);
    setUpdateAddressId(null);
    fetchCustomerAddressesByCustomerId(customerId);
  }, [
    updateAddressId,
    customerId,
    addressForm,
    updateCustomerAddress,
    fetchCustomerAddressesByCustomerId,
  ]);

  const handleDeleteAddress = useCallback(async () => {
    if (!addressIdToDelete || !customerId) return;
    await deleteCustomerAddress(addressIdToDelete);
    setIsDeleteConfirmOpen(false);
    setAddressIdToDelete(null);
    fetchCustomerAddressesByCustomerId(customerId);
  }, [addressIdToDelete, customerId, deleteCustomerAddress, fetchCustomerAddressesByCustomerId]);

  const handleOpenUpdateModal = useCallback((addr: CustomerAddress) => {
    setUpdateAddressId(addr._id);
    setAddressForm({
      addressType: addr.addressType || 'home',
      country: addr.country,
      firstName: addr.firstName,
      lastName: addr.lastName,
      company: addr.company || '',
      address: addr.address,
      apartment: addr.apartment || '',
      city: addr.city,
      state: addr.state,
      pinCode: addr.pinCode,
      phoneNumber: addr.phoneNumber,
    });
    setIsUpdateModalOpen(true);
  }, []);

  const handleCloseUpdateModal = useCallback(() => {
    setIsUpdateModalOpen(false);
    setUpdateAddressId(null);
  }, []);

  const handleOpenDeleteModal = useCallback((addressId: string) => {
    setAddressIdToDelete(addressId);
    setIsDeleteConfirmOpen(true);
  }, []);

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Addresses</h2>
        {addrLoading ? (
          <p className="text-sm text-gray-600">Loading addresses...</p>
        ) : addrError ? (
          <p className="text-sm text-red-600">{addrError}</p>
        ) : addresses && addresses.length > 0 ? (
          <CustomerAddressList
            addresses={addresses}
            onUpdate={handleOpenUpdateModal}
            onDelete={handleOpenDeleteModal}
          />
        ) : (
          <p className="text-sm text-gray-600">Currently no address added.</p>
        )}
      </div>

      {/* Update Customer Address Modal */}
      <UpdateCustomerAddressModal
        isOpen={isUpdateModalOpen}
        addressForm={addressForm}
        onAddressChange={handleAddressChange}
        onClose={handleCloseUpdateModal}
        onSubmit={handleUpdateAddress}
      />

      {/* Delete Address Confirmation Modal */}
      <DeleteAddressConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setAddressIdToDelete(null);
        }}
        onConfirm={handleDeleteAddress}
      />
    </>
  );
};

export default CustomerAddressesSection;

