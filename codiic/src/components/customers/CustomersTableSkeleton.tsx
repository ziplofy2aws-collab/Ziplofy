import React from 'react';
import { adminListTableCellClass } from '../admin-list-ui';

const NAME_WIDTHS = ['w-28', 'w-36', 'w-24', 'w-40', 'w-32', 'w-44', 'w-28', 'w-36'];
const EMAIL_WIDTHS = ['w-40', 'w-48', 'w-36', 'w-52', 'w-44', 'w-40', 'w-48', 'w-36'];
const PHONE_WIDTHS = ['w-24', 'w-28', 'w-20', 'w-32', 'w-24', 'w-28', 'w-20', 'w-24'];

/** Pulse rows matching the customers table column layout. */
export function CustomersTableSkeletonRows({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, index) => (
        <tr key={index} className="animate-pulse border-b border-admin-divider last:border-b-0">
          <td className={adminListTableCellClass}>
            <span
              className={`inline-block h-3.5 rounded bg-admin-fill ${NAME_WIDTHS[index % NAME_WIDTHS.length]}`}
            />
          </td>
          <td className={adminListTableCellClass}>
            <span
              className={`inline-block h-3.5 rounded bg-admin-secondary ${EMAIL_WIDTHS[index % EMAIL_WIDTHS.length]}`}
            />
          </td>
          <td className={adminListTableCellClass}>
            <span
              className={`inline-block h-3.5 rounded bg-admin-secondary ${PHONE_WIDTHS[index % PHONE_WIDTHS.length]}`}
            />
          </td>
          <td className={adminListTableCellClass}>
            <div className="flex gap-1">
              <span className="inline-block h-5 w-12 rounded-md bg-admin-secondary" />
              <span className="inline-block h-5 w-16 rounded-md bg-admin-secondary" />
            </div>
          </td>
          <td className={adminListTableCellClass}>
            <span className="inline-block h-3.5 w-20 rounded bg-admin-secondary" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default CustomersTableSkeletonRows;
