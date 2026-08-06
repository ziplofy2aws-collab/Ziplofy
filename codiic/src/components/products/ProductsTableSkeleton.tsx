import React from 'react';

const TITLE_WIDTHS = ['w-36', 'w-28', 'w-44', 'w-32', 'w-40', 'w-24', 'w-48', 'w-36'];
const CELL_WIDTHS = ['w-14', 'w-20', 'w-24', 'w-10', 'w-16', 'w-20'];

/** Pulse rows matching the products table column layout. */
export function ProductsTableSkeletonRows({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, index) => (
        <tr key={index} className="animate-pulse border-b border-admin-divider last:border-b-0">
          <td className="w-10 px-3 py-2.5 text-center">
            <span className="mx-auto block h-3.5 w-3.5 rounded bg-admin-fill" />
          </td>
          <td className="px-3 py-2.5">
            <div className="flex min-w-[180px] items-center gap-2.5">
              <span className="h-8 w-8 shrink-0 rounded-md bg-admin-fill" />
              <span
                className={`h-3.5 rounded bg-admin-fill ${TITLE_WIDTHS[index % TITLE_WIDTHS.length]}`}
              />
            </div>
          </td>
          {CELL_WIDTHS.map((width, cellIndex) => (
            <td key={cellIndex} className="whitespace-nowrap px-3 py-2.5">
              <span
                className={`inline-block h-3.5 rounded bg-admin-secondary ${
                  cellIndex === 0 ? 'w-14 rounded-full bg-admin-fill' : width
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default ProductsTableSkeletonRows;
