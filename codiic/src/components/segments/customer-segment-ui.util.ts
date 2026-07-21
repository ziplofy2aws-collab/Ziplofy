export const segmentInputClass =
  'w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] font-normal text-gray-700 transition-colors placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200';

export const segmentSecondaryButtonClass =
  'inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50';

export const segmentPrimaryButtonClass =
  'inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50';

export const segmentTableHeadClass = 'px-3 py-2.5 text-[12px] font-medium text-gray-500';

export const segmentTableHeadRightClass = `${segmentTableHeadClass} text-right`;

export const segmentTableCellClass = 'px-3 py-2.5 text-[13px] text-gray-700';

export const segmentTableCellRightClass = `${segmentTableCellClass} text-right`;

export function getCustomerFromSegmentEntry(customerId: string | {
  _id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}): { id: string; name: string; email: string } {
  if (typeof customerId === 'string') {
    return { id: customerId, name: customerId, email: '' };
  }

  const name =
    customerId.fullName ||
    `${customerId.firstName || ''} ${customerId.lastName || ''}`.trim() ||
    'Customer';

  return {
    id: customerId._id || '',
    name,
    email: customerId.email || '',
  };
}
