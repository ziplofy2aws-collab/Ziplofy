export const customerInputClass =
  'w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] font-normal text-gray-700 transition-colors placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200';

export const customerSecondaryButtonClass =
  'inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50';

export const customerPrimaryButtonClass =
  'inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50';

export const customerLabelClass = 'mb-1.5 block text-[13px] font-medium text-gray-700';

export const customerSectionTitleClass = 'text-[13px] font-semibold text-gray-900';

export const customerSectionSubtitleClass = 'mt-0.5 text-[12px] font-normal text-gray-500';

export const customerTableHeadClass = 'px-3 py-2.5 text-[12px] font-medium text-gray-500';

export const customerTableCellClass = 'px-3 py-2.5 text-[13px] text-gray-700';

export function formatCustomerName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(' ').trim() || '—';
}
