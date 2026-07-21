import React from 'react';
import type { CustomerAddress } from '../../contexts/customer-address.context';
import CustomerAddressItem from './CustomerAddressItem';

interface CustomerAddressListProps {
  addresses: CustomerAddress[];
  onUpdate: (address: CustomerAddress) => void;
  onDelete: (addressId: string) => void;
}

const CustomerAddressList: React.FC<CustomerAddressListProps> = ({
  addresses,
  onUpdate,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addresses.map((addr) => (
        <CustomerAddressItem key={addr._id} address={addr} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default CustomerAddressList;

