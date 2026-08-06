export const customerInputClass =
  'w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-[13px] font-normal text-admin-text transition-colors placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';

export const customerSecondaryButtonClass =
  'inline-flex items-center rounded-lg border border-admin-border bg-admin-surface px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-admin-row-hover disabled:cursor-not-allowed disabled:opacity-50';

export const customerPrimaryButtonClass =
  'inline-flex items-center rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';

export const customerLabelClass = 'mb-1.5 block text-[13px] font-medium text-gray-700';

export const customerSectionTitleClass = 'text-[13px] font-semibold text-gray-900';

export const customerSectionSubtitleClass = 'mt-0.5 text-[12px] font-normal text-gray-500';

export const customerTableHeadClass =
  'whitespace-nowrap px-3 py-2 text-left text-[12px] font-medium leading-5 text-[#616161]';

export const customerTableCellClass =
  'whitespace-nowrap px-3 py-2.5 text-[13px] font-normal text-admin-text-secondary';

export function formatCustomerName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(' ').trim() || '—';
}
