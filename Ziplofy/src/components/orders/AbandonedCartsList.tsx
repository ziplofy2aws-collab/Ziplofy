import React, { useCallback, useState } from 'react';
import AbandonedCartCard from './AbandonedCartCard';

interface CartItem {
  _id: string;
  productVariant: {
    images?: string[];
    sku: string;
    price: number;
    optionValues: Record<string, string>;
  };
  quantity: number;
}

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

interface Cart {
  customer: Customer;
  totalItems: number;
  cartItems: CartItem[];
  lastUpdated: string;
}

interface AbandonedCartsListProps {
  carts: Cart[];
  formatDate: (dateString: string) => string;
  onSendEmail: (customer: Customer) => void;
  onViewDetails: (customerId: string) => void;
}

const AbandonedCartsList: React.FC<AbandonedCartsListProps> = ({
  carts,
  formatDate,
  onSendEmail,
  onViewDetails,
}) => {
  const [openCustomerRowId, setOpenCustomerRowId] = useState<string | null>(null);

  const handleToggleCustomerPopover = useCallback((rowId: string) => {
    setOpenCustomerRowId((prev) => (prev === rowId ? null : rowId));
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Customer</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Cart</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Last activity</th>
            <th className="px-3 py-2.5 text-right text-[12px] font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {carts.map((cart) => (
            <AbandonedCartCard
              key={cart.customer._id}
              cart={cart}
              formatDate={formatDate}
              customerPopoverOpen={openCustomerRowId === cart.customer._id}
              onToggleCustomerPopover={handleToggleCustomerPopover}
              onSendEmail={onSendEmail}
              onViewDetails={onViewDetails}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AbandonedCartsList;
