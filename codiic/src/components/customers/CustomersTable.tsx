import React from 'react';
import type { Customer } from '../../contexts/customer.context';
import {
  adminListTableHeadClass,
  adminListTableHeadRowClass,
} from '../admin-list-ui';
import CustomersTableItem from './CustomersTableItem';
import { CustomersTableSkeletonRows } from './CustomersTableSkeleton';

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
    <div className="overflow-x-auto bg-admin-surface">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className={adminListTableHeadRowClass}>
            <th className={adminListTableHeadClass}>Name</th>
            <th className={adminListTableHeadClass}>Email</th>
            <th className={adminListTableHeadClass}>Phone</th>
            <th className={adminListTableHeadClass}>Tags</th>
            <th className={adminListTableHeadClass}>Created</th>
          </tr>
        </thead>
        <tbody className="bg-admin-surface">
          {loading ? (
            <CustomersTableSkeletonRows />
          ) : customers.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-16 text-center">
                <p className="text-[15px] font-semibold text-admin-text">No customers found</p>
                <p className="mt-1.5 text-[13px] font-normal text-admin-text-secondary">
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
