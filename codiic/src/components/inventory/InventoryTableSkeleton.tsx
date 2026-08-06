import React from 'react';

const TITLE_WIDTHS = ['w-40', 'w-32', 'w-48', 'w-28', 'w-36', 'w-44', 'w-24', 'w-40'];
const SKU_WIDTHS = ['w-16', 'w-20', 'w-14', 'w-24', 'w-16', 'w-16', 'w-20', 'w-12'];

/** Pulse rows matching the inventory table column layout. */
export function InventoryTableSkeletonRows({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, index) => (
        <tr key={index} className="animate-pulse border-b border-admin-divider last:border-b-0">
          <td className="sticky left-0 z-10 w-10 bg-admin-surface px-3 py-2.5 text-center">
            <span className="mx-auto block h-3.5 w-3.5 rounded bg-admin-fill" />
          </td>
          <td className="sticky left-10 z-10 bg-admin-surface px-3 py-2.5 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
            <div className="flex min-w-[220px] items-center gap-3">
              <span className="h-9 w-9 shrink-0 rounded-md bg-admin-fill" />
              <div className="min-w-0 space-y-1.5">
                <span
                  className={`block h-3.5 rounded bg-admin-fill ${TITLE_WIDTHS[index % TITLE_WIDTHS.length]}`}
                />
                <span className="block h-3 w-20 rounded bg-admin-secondary" />
              </div>
            </div>
          </td>
          <td className="px-3 py-2.5">
            <span
              className={`inline-block h-3.5 rounded bg-admin-secondary ${SKU_WIDTHS[index % SKU_WIDTHS.length]}`}
            />
          </td>
          {Array.from({ length: 5 }, (_, cellIndex) => (
            <td key={cellIndex} className="px-3 py-2.5 text-right">
              <span className="ml-auto inline-block h-3.5 w-8 rounded bg-admin-secondary" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default InventoryTableSkeletonRows;
