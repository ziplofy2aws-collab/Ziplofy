export const PO_FORM_APPEARANCE = 'minimal' as const;

export const poInputClass =
  'w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-[13px] font-normal text-admin-text transition-colors placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';

export const poSecondaryButtonClass =
  'inline-flex items-center rounded-lg border border-admin-border bg-admin-surface px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-admin-row-hover disabled:cursor-not-allowed disabled:opacity-50';

export const poPrimaryButtonClass =
  'inline-flex items-center rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';

export const poTableHeadClass =
  'whitespace-nowrap px-3 py-2 text-left text-[12px] font-medium leading-5 text-[#616161]';

export const poTableHeadRightClass = `${poTableHeadClass} text-right`;

export const poTableCellClass =
  'whitespace-nowrap px-3 py-2.5 text-[13px] font-normal text-admin-text-secondary';

export const poTableCellRightClass = `${poTableCellClass} text-right`;

export function formatPurchaseOrderLabel(id: string): string {
  if (!id) return '—';
  return `#${id.slice(-6).toUpperCase()}`;
}

export function formatPurchaseOrderStatus(status: string): string {
  return status.replaceAll('_', ' ');
}
