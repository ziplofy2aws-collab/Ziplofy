import React from 'react';
import type { CustomerAddress } from '../../contexts/customer-address.context';

interface CustomerAddressItemProps {
  address: CustomerAddress;
  onUpdate: (address: CustomerAddress) => void;
  onDelete: (addressId: string) => void;
}

const CustomerAddressItem: React.FC<CustomerAddressItemProps> = ({ address, onUpdate, onDelete }) => {
  return (
    <div className="bg-white border border-gray-200 rounded p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 capitalize">{address.addressType || 'home'}</h3>
        <div className="flex gap-1.5">
          <button
            onClick={() => onUpdate(address)}
            className="px-2 py-1 text-xs font-medium text-gray-700 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            Update
          </button>
          <button
            onClick={() => onDelete(address._id)}
            className="px-2 py-1 text-xs font-medium text-gray-700 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="space-y-1 text-sm text-gray-700">
        <p className="font-medium text-gray-900">
          {address.firstName} {address.lastName}
        </p>
        <p className="text-gray-600">
          {address.address}
          {address.apartment ? `, ${address.apartment}` : ''}
        </p>
        <p className="text-gray-600">
          {address.city}, {address.state} {address.pinCode}
        </p>
        <p className="text-gray-600">{address.country}</p>
        <p className="text-gray-600">{address.phoneNumber}</p>
      </div>
    </div>
  );
};

export default CustomerAddressItem;

