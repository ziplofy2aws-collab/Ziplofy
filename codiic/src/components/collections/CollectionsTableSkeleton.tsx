import React from 'react';

const TITLE_WIDTHS = ['w-40', 'w-28', 'w-48', 'w-32', 'w-36', 'w-24', 'w-44', 'w-36'];

/** Pulse rows matching the collections table column layout. */
export function CollectionsTableSkeletonRows({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, index) => (
        <tr key={index} className="animate-pulse border-b border-admin-divider last:border-b-0">
          <td className="w-10 px-3 py-2.5 text-center align-middle">
            <span className="mx-auto block h-3.5 w-3.5 rounded bg-admin-fill" />
          </td>
          <td className="px-3 py-2.5 align-middle">
            <div className="flex min-w-0 items-center gap-3">
              <span className="h-10 w-10 shrink-0 rounded-md bg-admin-fill" />
              <span
                className={`h-3.5 rounded bg-admin-fill ${TITLE_WIDTHS[index % TITLE_WIDTHS.length]}`}
              />
            </div>
          </td>
          <td className="px-3 py-2.5 text-right align-middle">
            <span className="ml-auto inline-block h-3.5 w-8 rounded bg-admin-secondary" />
          </td>
          <td className="px-3 py-2.5 text-right align-middle">
            <span className="ml-auto inline-block h-3.5 w-6 rounded bg-admin-secondary" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default CollectionsTableSkeletonRows;
