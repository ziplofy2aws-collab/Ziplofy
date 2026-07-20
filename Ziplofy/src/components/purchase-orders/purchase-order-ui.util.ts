export const PO_FORM_APPEARANCE = 'minimal' as const;

export const poInputClass =
  'w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] font-normal text-gray-700 transition-colors placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200';

export const poSecondaryButtonClass =
  'inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50';

export const poPrimaryButtonClass =
  'inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50';

export const poTableHeadClass = 'px-3 py-2.5 text-[12px] font-medium text-gray-500';

export const poTableHeadRightClass = `${poTableHeadClass} text-right`;

export const poTableCellClass = 'px-3 py-2.5 text-[13px] text-gray-700';

export const poTableCellRightClass = `${poTableCellClass} text-right`;

export function formatPurchaseOrderLabel(id: string): string {
  if (!id) return '—';
  return `#${id.slice(-6).toUpperCase()}`;
}

export function formatPurchaseOrderStatus(status: string): string {
  return status.replaceAll('_', ' ');
}
