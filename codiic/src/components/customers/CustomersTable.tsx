import React from 'react';
import type { Customer } from '../../contexts/customer.context';
import CustomersTableItem from './CustomersTableItem';
import { CustomersTableSkeletonRows } from './CustomersTableSkeleton';
import { customerTableHeadClass } from './customer-ui.util';

interface CustomersTableProps {
  customers: Customer[];
  loading?: boolean;
  onCustomerClick: (customerId: string) => void;
}

const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  loading = false,
  onCustomerClick,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className={customerTableHeadClass}>Name</th>
            <th className={customerTableHeadClass}>Email</th>
            <th className={customerTableHeadClass}>Phone</th>
            <th className={customerTableHeadClass}>Tags</th>
            <th className={customerTableHeadClass}>Created</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {loading ? (
            <CustomersTableSkeletonRows />
          ) : customers.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-16 text-center">
                <p className="text-[15px] font-semibold text-gray-900">No customers found</p>
                <p className="mt-1.5 text-[13px] font-normal text-gray-500">
                  Try changing the search term
                </p>
              </td>
            </tr>
          ) : (
            customers.map((customer) => (
              <CustomersTableItem
                key={customer._id}
                customer={customer}
                onClick={onCustomerClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomersTable;
