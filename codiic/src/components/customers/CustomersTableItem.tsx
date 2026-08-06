import React from 'react';
import type { Customer, CustomerTag } from '../../contexts/customer.context';
import { adminListRowClass, adminListTableCellClass } from '../admin-list-ui';
import { formatCustomerName } from './customer-ui.util';

interface CustomersTableItemProps {
  customer: Customer;
  onClick: (customerId: string) => void;
}

function getTagLabel(tag: CustomerTag | string): string {
  if (typeof tag === 'string') return tag;
  return tag.name;
}

const CustomersTableItem: React.FC<CustomersTableItemProps> = ({ customer, onClick }) => {
  const name = formatCustomerName(customer.firstName, customer.lastName);
  const tags = Array.isArray(customer.tagIds) ? customer.tagIds : [];

  return (
    <tr onClick={() => onClick(customer._id)} className={adminListRowClass}>
      <td className={`${adminListTableCellClass} font-medium text-admin-text`}>{name}</td>
      <td className={adminListTableCellClass}>{customer.email || '—'}</td>
      <td className={adminListTableCellClass}>{customer.phoneNumber || '—'}</td>
      <td className={adminListTableCellClass}>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={typeof tag === 'string' ? tag : tag._id}
                className="inline-flex items-center rounded-md bg-admin-secondary px-2 py-0.5 text-[11px] font-medium text-admin-text"
              >
                {getTagLabel(tag)}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-admin-text-subdued">—</span>
        )}
      </td>
      <td className={`${adminListTableCellClass} text-admin-text-subdued`}>
        {new Date(customer.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );
};

export default CustomersTableItem;
