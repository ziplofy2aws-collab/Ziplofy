export const segmentInputClass =
  'w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-[13px] font-normal text-admin-text transition-colors placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';

export const segmentSecondaryButtonClass =
  'inline-flex items-center rounded-lg border border-admin-border bg-admin-surface px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-admin-row-hover disabled:cursor-not-allowed disabled:opacity-50';

export const segmentPrimaryButtonClass =
  'inline-flex items-center rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';

export const segmentTableHeadClass =
  'whitespace-nowrap px-3 py-2 text-left text-[12px] font-medium leading-5 text-[#616161]';

export const segmentTableHeadRightClass = `${segmentTableHeadClass} text-right`;

export const segmentTableCellClass =
  'whitespace-nowrap px-3 py-2.5 text-[13px] font-normal text-admin-text-secondary';

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
