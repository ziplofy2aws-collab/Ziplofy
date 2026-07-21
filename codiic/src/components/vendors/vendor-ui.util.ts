export const vendorInputClass =
  'w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] font-normal text-gray-700 transition-colors placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200';

export const vendorSecondaryButtonClass =
  'inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50';

export const vendorPrimaryButtonClass =
  'inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50';

export const vendorTableHeadClass = 'px-3 py-2.5 text-[12px] font-medium text-gray-500';

export const vendorTableHeadRightClass = `${vendorTableHeadClass} text-right`;

export const vendorTableCellClass = 'px-3 py-2.5 text-[13px] text-gray-700';

export const vendorTableCellRightClass = `${vendorTableCellClass} text-right`;

export function getVendorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
