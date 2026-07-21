import React from 'react';
import type { Customer, CustomerTag } from '../../contexts/customer.context';
import {
  customerTableCellClass,
  formatCustomerName,
} from './customer-ui.util';

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
    <tr
      onClick={() => onClick(customer._id)}
      className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50/60"
    >
      <td className={`${customerTableCellClass} font-medium text-gray-900`}>{name}</td>
      <td className={customerTableCellClass}>{customer.email || '—'}</td>
      <td className={customerTableCellClass}>{customer.phoneNumber || '—'}</td>
      <td className={customerTableCellClass}>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={typeof tag === 'string' ? tag : tag._id}
                className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600"
              >
                {getTagLabel(tag)}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className={`${customerTableCellClass} text-gray-500`}>
        {new Date(customer.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );
};

export default CustomersTableItem;
