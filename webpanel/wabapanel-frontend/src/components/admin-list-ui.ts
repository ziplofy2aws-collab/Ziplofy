/** Shared Orbitly-soft list chrome for client pages. */

import { adminContentColumnClass } from '@/components/layout/dashboard-ui';

export const adminListPageShellClass = 'w-full';

export const adminListPageInnerClass = adminContentColumnClass;

export const adminListCardClass =
  'overflow-hidden rounded-2xl border border-white/50 bg-white/55 shadow-[0_8px_28px_rgba(15,61,46,0.06),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl';

export const adminListFilterBarClass =
  'flex items-center gap-2 border-b border-[#e8efe9] bg-white/80 px-3 py-2.5';

export const adminListFilterChipClass =
  'inline-flex items-center gap-1 rounded-xl bg-[#eef8f0] px-2.5 py-1.5 text-[13px] font-medium text-[#0f3d2e] transition-colors hover:bg-[#d4f4d8]';

export const adminListSearchInputClass =
  'w-full rounded-xl border border-[#e8efe9] bg-[#f7fbf8] py-1.5 pl-8 pr-3 text-[13px] font-normal text-[#303030] placeholder:text-[#8a9a93] focus:border-[#b7e4c0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4f4d8]';

export const adminListTableHeadRowClass = 'border-b border-[#e8efe9] bg-[#f7fbf8]';

export const adminListTableHeadClass =
  'whitespace-nowrap px-3 py-2.5 text-left text-[12px] font-medium leading-5 text-[#8a9a93]';

export const adminListTableCellClass =
  'whitespace-nowrap px-3 py-3 text-[13px] font-normal text-[#6b7a74]';

export const adminListRowClass =
  'group cursor-pointer border-b border-[#eef3ef] bg-white/80 transition-colors last:border-b-0 hover:bg-[#f4faf5]';

export const adminListFooterLinkClass = 'text-[#0f766e] hover:underline';

export {
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from '@/components/layout/dashboard-ui';
