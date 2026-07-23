import React from 'react';
import { customerTableCellClass } from './customer-ui.util';

const NAME_WIDTHS = ['w-28', 'w-36', 'w-24', 'w-40', 'w-32', 'w-44', 'w-28', 'w-36'];
const EMAIL_WIDTHS = ['w-40', 'w-48', 'w-36', 'w-52', 'w-44', 'w-40', 'w-48', 'w-36'];
const PHONE_WIDTHS = ['w-24', 'w-28', 'w-20', 'w-32', 'w-24', 'w-28', 'w-20', 'w-24'];

/** Pulse rows matching the customers table column layout. */
export function CustomersTableSkeletonRows({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, index) => (
        <tr key={index} className="animate-pulse border-b border-gray-100 last:border-b-0">
          <td className={customerTableCellClass}>
            <span
              className={`inline-block h-3.5 rounded bg-gray-200 ${NAME_WIDTHS[index % NAME_WIDTHS.length]}`}
            />
          </td>
          <td className={customerTableCellClass}>
            <span
              className={`inline-block h-3.5 rounded bg-gray-100 ${EMAIL_WIDTHS[index % EMAIL_WIDTHS.length]}`}
            />
          </td>
          <td className={customerTableCellClass}>
            <span
              className={`inline-block h-3.5 rounded bg-gray-100 ${PHONE_WIDTHS[index % PHONE_WIDTHS.length]}`}
            />
          </td>
          <td className={customerTableCellClass}>
            <div className="flex gap-1">
              <span className="inline-block h-5 w-12 rounded-full bg-gray-100" />
              <span className="inline-block h-5 w-16 rounded-full bg-gray-100" />
            </div>
          </td>
          <td className={customerTableCellClass}>
            <span className="inline-block h-3.5 w-20 rounded bg-gray-100" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default CustomersTableSkeletonRows;
