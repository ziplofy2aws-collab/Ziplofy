export const vendorInputClass =
  'w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-[13px] font-normal text-admin-text transition-colors placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';

export const vendorSecondaryButtonClass =
  'inline-flex items-center rounded-lg border border-admin-border bg-admin-surface px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-admin-row-hover disabled:cursor-not-allowed disabled:opacity-50';

export const vendorPrimaryButtonClass =
  'inline-flex items-center rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';

export const vendorTableHeadClass =
  'whitespace-nowrap px-3 py-2 text-left text-[12px] font-medium leading-5 text-[#616161]';

export const vendorTableHeadRightClass = `${vendorTableHeadClass} text-right`;

export const vendorTableCellClass =
  'whitespace-nowrap px-3 py-2.5 text-[13px] font-normal text-admin-text-secondary';

export const vendorTableCellRightClass = `${vendorTableCellClass} text-right`;

export function getVendorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
