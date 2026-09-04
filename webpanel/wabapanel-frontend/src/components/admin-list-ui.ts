/** Shared Shopify-style list chrome (Codiic parity). */

import { adminContentColumnClass } from '@/components/layout/dashboard-ui';

export const adminListPageShellClass = 'w-full';

export const adminListPageInnerClass = adminContentColumnClass;

export const adminListCardClass =
  'overflow-hidden rounded-xl border border-admin-border bg-white';

export const adminListFilterBarClass =
  'flex items-center gap-2 border-b border-admin-border bg-white px-3 py-2.5';

export const adminListFilterChipClass =
  'inline-flex items-center gap-1 rounded-lg bg-[#ebebeb] px-2.5 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#d4d4d4]';

export const adminListSearchInputClass =
  'w-full rounded-lg border border-admin-border bg-white py-1.5 pl-8 pr-3 text-[13px] font-normal text-admin-text placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';

export const adminListTableHeadRowClass = 'border-b border-admin-border bg-[#f6f6f7]';

export const adminListTableHeadClass =
  'whitespace-nowrap px-3 py-2 text-left text-[12px] font-medium leading-5 text-[#616161]';

export const adminListTableCellClass =
  'whitespace-nowrap px-3 py-2.5 text-[13px] font-normal text-admin-text-secondary';

export const adminListRowClass =
  'group cursor-pointer border-b border-admin-border/70 bg-white transition-colors last:border-b-0 hover:bg-[#f6f6f7]';

export const adminListFooterLinkClass = 'text-[#005bd3] hover:underline';

export {
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from '@/components/layout/dashboard-ui';
