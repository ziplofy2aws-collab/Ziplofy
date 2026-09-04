/** Shared Shopify-style list chrome for Products family list pages. */

import { adminContentColumnClass } from './layout/admin-page-width';

export const adminListPageShellClass = 'w-full';

export const adminListPageInnerClass = adminContentColumnClass;

export const adminListCardClass =
  'overflow-hidden rounded-xl border border-admin-border bg-admin-surface';

export const adminListPrimaryButtonClass =
  'inline-flex items-center rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';

export const adminListSecondaryButtonClass =
  'inline-flex items-center rounded-lg border border-admin-border bg-admin-surface px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-admin-row-hover disabled:cursor-not-allowed disabled:opacity-50';

export const adminListFilterBarClass =
  'flex items-center gap-2 border-b border-admin-border bg-admin-surface px-3 py-2.5';

export const adminListFilterChipClass =
  'inline-flex items-center gap-1 rounded-lg bg-admin-fill px-2.5 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#d4d4d4]';

export const adminListSearchInputClass =
  'w-full rounded-lg border border-admin-border bg-admin-surface py-1.5 pl-8 pr-3 text-[13px] font-normal text-admin-text placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';

export const adminListTableHeadRowClass =
  'border-b border-admin-border bg-admin-table-header';

export const adminListTableHeadClass =
  'whitespace-nowrap px-3 py-2 text-left text-[12px] font-medium leading-5 text-[#616161]';

export const adminListTableHeadRightClass = `${adminListTableHeadClass} text-right`;

export const adminListTableCellClass =
  'whitespace-nowrap px-3 py-2.5 text-[13px] font-normal text-admin-text-secondary';

export const adminListTableCellRightClass = `${adminListTableCellClass} text-right`;

export const adminListRowClass =
  'group cursor-pointer border-b border-admin-divider bg-admin-surface transition-colors last:border-b-0 hover:bg-admin-row-hover';

export const adminListFooterLinkClass = 'text-[#005bd3] hover:underline';
