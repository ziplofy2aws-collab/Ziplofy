import { PlusIcon, ShoppingBagIcon, UserIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';

export interface CustomerInfo {
  id?: string;
  name: string;
  orderCount?: number;
  isTaxExempt?: boolean;
}

interface OrderCustomerSectionProps {
  customer?: CustomerInfo;
  onCreateNewCustomer?: () => void;
}

const OrderCustomerSection: React.FC<OrderCustomerSectionProps> = ({
  customer = {
    name: 'Alex Jander',
    orderCount: 0,
    isTaxExempt: true,
  },
  onCreateNewCustomer,
}) => {
  const handleCreateNewCustomer = useCallback(() => {
    if (onCreateNewCustomer) {
      onCreateNewCustomer();
    } else {
      console.log('Create new customer clicked');
    }
  }, [onCreateNewCustomer]);

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="px-5 py-4">
        {/* Header with Title and Create Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="pl-3 border-l-4 border-blue-600">
            <h3 className="text-base font-semibold text-gray-900">Customer</h3>
            <p className="text-xs text-gray-500 mt-0.5">Customer information for this order</p>
          </div>
          <button
            onClick={handleCreateNewCustomer}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create a new customer</span>
          </button>
        </div>

        {/* Customer Info */}
        <div className="space-y-2">
          {/* Customer Name */}
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-900">{customer.name}</span>
          </div>
          
          {/* Order Count */}
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-900">
              {customer.orderCount === 0 || customer.orderCount === undefined
                ? 'No orders'
                : `${customer.orderCount} ${customer.orderCount === 1 ? 'order' : 'orders'}`}
            </span>
          </div>
        </div>

        {/* Tax Exempt Status */}
        {customer.isTaxExempt && (
          <p className="text-sm text-gray-500 mt-3">Customer is tax-exempt</p>
        )}
      </div>
    </div>
  );
};

export default OrderCustomerSection;

